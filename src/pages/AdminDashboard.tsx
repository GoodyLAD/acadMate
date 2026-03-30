import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Users,
  UserCheck,
  BookOpen,
  Calendar,
  Settings,
  BarChart3,
  TrendingUp,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Globe,
  Database,
  Server,
  Eye,
  RefreshCw,
  Link as LinkIcon,
  Plug,
  Code,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalFaculty: number;
  verifiedFaculty: number;
  totalStudents: number;
  totalAssignments: number;
}

const AdminDashboard = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalFaculty: 0,
    verifiedFaculty: 0,
    totalStudents: 0,
    totalAssignments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Fetch faculty stats
      const { data: faculty, error: facultyError } = await supabase
        .from('faculty')
        .select('is_verified');

      if (facultyError) {
        console.error('Faculty fetch error:', facultyError);
        throw facultyError;
      }

      // Fetch student stats
      const { data: students, error: studentsError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'student');

      if (studentsError) {
        console.error('Students fetch error:', studentsError);
        throw studentsError;
      }

      // Fetch assignment stats - handle case where table might not exist
      let assignments = [];
      try {
        const { data: assignmentData, error: assignmentsError } = await supabase
          .from('student_mentor_assignments')
          .select('id');

        if (assignmentsError) {
          console.warn(
            'Assignments table not found or error:',
            assignmentsError
          );
          // Don't throw error, just use empty array
        } else {
          assignments = assignmentData || [];
        }
      } catch (tableError) {
        console.warn('Assignments table does not exist:', tableError);
        assignments = [];
      }

      setStats({
        totalFaculty: faculty?.length || 0,
        verifiedFaculty: faculty?.filter(f => f.is_verified).length || 0,
        totalStudents: students?.length || 0,
        totalAssignments: assignments.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: 'Error',
        description: `Failed to load dashboard statistics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Faculty',
      value: stats.totalFaculty,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
      link: '/admin/faculty',
      change: '+12%',
      changeType: 'positive',
      description: 'Registered faculty members',
    },
    {
      title: 'Verified Faculty',
      value: stats.verifiedFaculty,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-gradient-to-br from-green-500 to-green-600',
      link: '/admin/faculty',
      change: '+8%',
      changeType: 'positive',
      description: 'Verified and active',
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: BookOpen,
      color: 'text-purple-600',
      bgColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      link: '/',
      change: '+24%',
      changeType: 'positive',
      description: 'Enrolled students',
    },
    {
      title: 'Active Assignments',
      value: stats.totalAssignments,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      link: '/admin/assignments',
      change: '+5%',
      changeType: 'positive',
      description: 'Mentor-student pairs',
    },
    {
      title: 'LMS Integrations',
      value: '0',
      icon: Plug,
      color: 'text-indigo-600',
      bgColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      link: '/admin/integrations',
      change: 'New',
      changeType: 'positive',
      description: 'Connected systems',
    },
  ];

  const quickActions = [
    {
      title: 'Manage Faculty',
      description: 'Add, edit, and verify faculty members',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/faculty',
    },
    {
      title: 'Assign Mentors',
      description: 'Create mentor-student assignments',
      icon: Calendar,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/assignments',
    },
    {
      title: 'LMS/ERP Integration',
      description: 'Connect with external learning systems',
      icon: Plug,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      link: '/admin/integrations',
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Settings,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '#',
      disabled: true,
    },
    {
      title: 'View Analytics',
      description: 'Detailed system analytics',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '#',
      disabled: true,
    },
  ];

  const recentActivities = [
    {
      title: 'System Initialized',
      description: 'Admin portal is now active and ready',
      time: '2 minutes ago',
      type: 'success',
      icon: CheckCircle,
    },
    {
      title: 'Database Connected',
      description: 'Successfully connected to Supabase',
      time: '5 minutes ago',
      type: 'info',
      icon: Database,
    },
    {
      title: 'Faculty Verification',
      description: '3 new faculty members pending verification',
      time: '1 hour ago',
      type: 'warning',
      icon: AlertCircle,
    },
    {
      title: 'System Update',
      description: 'Latest security patches applied',
      time: '2 hours ago',
      type: 'success',
      icon: Shield,
    },
  ];

  return (
    <div className='space-y-8'>
      {/* Hero Header */}
      <div className='relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-3xl mb-8'>
        <div className='absolute inset-0 bg-black/10'></div>
        <div className='relative px-8 py-12 text-white'>
          <div className='flex items-center justify-between'>
            <div className='max-w-3xl'>
              <Badge className='mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30'>
                <Shield className='w-3 h-3 mr-1' />
                Admin Portal
              </Badge>
              <h1 className='text-4xl font-bold mb-4 leading-tight'>
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Admin'}! 👋
              </h1>
              <p className='text-xl text-blue-100 mb-6 leading-relaxed'>
                Manage your educational platform with powerful admin tools and
                real-time insights.
              </p>
              <div className='flex flex-wrap gap-4'>
                <Button
                  size='lg'
                  className='bg-white text-blue-600 hover:bg-blue-50 font-semibold'
                >
                  <Activity className='w-5 h-5 mr-2' />
                  View Analytics
                </Button>
                <Button
                  size='lg'
                  className='bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60 shadow-lg'
                >
                  <RefreshCw className='w-5 h-5 mr-2' />
                  Refresh Data
                </Button>
              </div>
            </div>
            <div className='hidden lg:block'>
              <div className='w-32 h-32 bg-white/10 rounded-full flex items-center justify-center'>
                <Shield className='w-16 h-16 text-white/80' />
              </div>
            </div>
          </div>
        </div>
        <div className='absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full'></div>
        <div className='absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full'></div>
      </div>

      {/* Stats Overview */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link}>
              <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm hover:scale-105'>
                <CardContent className='p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <div
                      className={`p-3 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform`}
                    >
                      <Icon className='h-6 w-6 text-white' />
                    </div>
                    <div className='flex items-center text-green-600 text-sm font-medium'>
                      <TrendingUp className='w-4 h-4 mr-1' />
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-600 mb-1'>
                      {stat.title}
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mb-1'>
                      {loading ? (
                        <div className='animate-pulse bg-gray-200 h-8 w-16 rounded'></div>
                      ) : (
                        stat.value
                      )}
                    </p>
                    <p className='text-xs text-gray-500'>{stat.description}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
        {/* Quick Actions */}
        <div className='lg:col-span-2'>
          <Card className='border-0 bg-white/80 backdrop-blur-sm'>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-3 text-xl'>
                  <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg'>
                    <Zap className='h-5 w-5 text-white' />
                  </div>
                  Quick Actions
                </CardTitle>
                <Badge variant='secondary' className='text-xs'>
                  <Activity className='w-3 h-3 mr-1' />
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link key={index} to={action.disabled ? '#' : action.link}>
                      <Button
                        variant='outline'
                        className={`w-full h-20 justify-start text-left hover:shadow-md transition-all duration-200 ${
                          action.disabled
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-105'
                        }`}
                        disabled={action.disabled}
                      >
                        <div className='flex items-center space-x-4 w-full'>
                          <div className={`p-3 rounded-lg ${action.bgColor}`}>
                            <Icon className={`h-5 w-5 ${action.color}`} />
                          </div>
                          <div className='flex-1'>
                            <p className='font-semibold text-gray-900'>
                              {action.title}
                            </p>
                            <p className='text-xs text-gray-600'>
                              {action.description}
                            </p>
                          </div>
                          {!action.disabled && (
                            <ArrowRight className='h-4 w-4 text-gray-400' />
                          )}
                        </div>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div>
          <Card className='border-0 bg-white/80 backdrop-blur-sm'>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-3 text-xl'>
                  <div className='bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg'>
                    <Activity className='h-5 w-5 text-white' />
                  </div>
                  Recent Activity
                </CardTitle>
                <Badge variant='secondary' className='text-xs'>
                  <Clock className='w-3 h-3 mr-1' />
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                {recentActivities.map((activity, index) => {
                  const Icon = activity.icon;
                  const colorMap = {
                    success: 'text-green-600',
                    info: 'text-blue-600',
                    warning: 'text-orange-600',
                    error: 'text-red-600',
                  };
                  return (
                    <div
                      key={index}
                      className='flex items-start space-x-3 p-3 bg-gray-50 rounded-xl'
                    >
                      <div
                        className={`p-2 rounded-full ${colorMap[activity.type as keyof typeof colorMap]}`}
                      >
                        <Icon className='h-4 w-4' />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='font-semibold text-gray-900 text-sm'>
                          {activity.title}
                        </p>
                        <p className='text-xs text-gray-600 mb-1'>
                          {activity.description}
                        </p>
                        <p className='text-xs text-gray-500'>{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* LMS/ERP Integration Section */}
      <div className='mb-8'>
        <Card className='border-0 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-3 text-2xl text-indigo-900'>
                  <div className='bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl'>
                    <Plug className='h-6 w-6 text-white' />
                  </div>
                  LMS/ERP Integration
                </CardTitle>
                <p className='text-indigo-700 mt-2'>
                  Connect your SIH2 platform with external learning management
                  systems and enterprise resource planning tools
                </p>
              </div>
              <Link to='/admin/integrations'>
                <Button
                  size='lg'
                  className='bg-indigo-600 hover:bg-indigo-700 text-white'
                >
                  <LinkIcon className='h-5 w-5 mr-2' />
                  Manage Integrations
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='text-center p-4 bg-white/60 rounded-xl'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <Globe className='h-6 w-6 text-blue-600' />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>Moodle</h3>
                <p className='text-sm text-gray-600 mb-3'>
                  Connect with Moodle LMS
                </p>
                <Badge variant='outline' className='text-xs'>
                  Ready
                </Badge>
              </div>
              <div className='text-center p-4 bg-white/60 rounded-xl'>
                <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <Globe className='h-6 w-6 text-green-600' />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>Canvas</h3>
                <p className='text-sm text-gray-600 mb-3'>
                  Connect with Canvas LMS
                </p>
                <Badge variant='outline' className='text-xs'>
                  Ready
                </Badge>
              </div>
              <div className='text-center p-4 bg-white/60 rounded-xl'>
                <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <Globe className='h-6 w-6 text-purple-600' />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>Blackboard</h3>
                <p className='text-sm text-gray-600 mb-3'>
                  Connect with Blackboard
                </p>
                <Badge variant='outline' className='text-xs'>
                  Ready
                </Badge>
              </div>
            </div>
            <div className='mt-6 p-4 bg-white/40 rounded-xl'>
              <div className='flex items-center justify-between'>
                <div>
                  <h4 className='font-semibold text-gray-900'>Quick Setup</h4>
                  <p className='text-sm text-gray-600'>
                    Get started with your first integration in minutes
                  </p>
                </div>
                <Link to='/admin/integrations'>
                  <Button
                    variant='outline'
                    className='border-indigo-300 text-indigo-700 hover:bg-indigo-50'
                  >
                    <ArrowRight className='h-4 w-4 mr-2' />
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Developer Tools Section */}
      <div className='mb-8'>
        <Card className='border-0 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle className='flex items-center gap-3 text-2xl text-purple-900'>
                  <div className='bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl'>
                    <Code className='h-6 w-6 text-white' />
                  </div>
                  Developer Tools
                </CardTitle>
                <p className='text-purple-700 mt-2'>
                  Tools for developers to test APIs and manage system data
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='text-center p-4 bg-white/60 rounded-xl'>
                <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <Code className='h-6 w-6 text-purple-600' />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  API Testing Lab
                </h3>
                <p className='text-sm text-gray-600 mb-3'>
                  Test and experiment with different APIs
                </p>
                <Link to='/admin/api-testing'>
                  <Button
                    variant='outline'
                    className='border-purple-300 text-purple-700 hover:bg-purple-50'
                  >
                    <Code className='h-4 w-4 mr-2' />
                    Open API Lab
                  </Button>
                </Link>
              </div>
              <div className='text-center p-4 bg-white/60 rounded-xl'>
                <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                  <Database className='h-6 w-6 text-blue-600' />
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Test Data Management
                </h3>
                <p className='text-sm text-gray-600 mb-3'>
                  Load and manage sample data for testing
                </p>
                <Badge variant='outline' className='text-xs'>
                  Available in floating button
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* System Health */}
        <Card className='border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg'>
                <Server className='h-5 w-5 text-white' />
              </div>
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Database Connection</span>
                <Badge className='bg-green-100 text-green-800'>
                  <CheckCircle className='w-3 h-3 mr-1' />
                  Healthy
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>API Response Time</span>
                <span className='text-sm text-gray-600'>45ms</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Uptime</span>
                <span className='text-sm text-gray-600'>99.9%</span>
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between text-sm'>
                  <span>System Load</span>
                  <span>68%</span>
                </div>
                <Progress value={68} className='h-2' />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Info */}
        <Card className='border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-3'>
              <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg'>
                <Eye className='h-5 w-5 text-white' />
              </div>
              Admin Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Current User</span>
                <span className='text-sm text-gray-600'>
                  {profile?.full_name}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Role</span>
                <Badge className='bg-purple-100 text-purple-800'>
                  {profile?.role?.toUpperCase()}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Email</span>
                <span className='text-sm text-gray-600 truncate'>
                  {profile?.email}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>Access Level</span>
                <Badge className='bg-green-100 text-green-800'>
                  <Shield className='w-3 h-3 mr-1' />
                  Full Access
                </Badge>
              </div>
              <div className='pt-2'>
                <Link
                  to='/admin-debug'
                  className='text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center'
                >
                  <Database className='w-4 h-4 mr-1' />
                  View Debug Information
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
