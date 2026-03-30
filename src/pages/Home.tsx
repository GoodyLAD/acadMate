import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Waves from '@/components/Waves';
import { cn } from '@/lib/utils';
import {
  GraduationCap,
  FileText,
  FolderOpen,
  Activity,
  Award,
  TrendingUp,
  Users,
  Calendar,
  Target,
  BookOpen,
  Check,
  ArrowRight,
  Star,
  Clock,
  BarChart3,
  Zap,
  Shield,
  Globe,
} from 'lucide-react';

const Home = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  // Redirect admin-level faculty to admin dashboard
  useEffect(() => {
    if (
      profile &&
      profile.role === 'faculty' &&
      profile.faculty_level === 'admin'
    ) {
      navigate('/admin', { replace: true });
    }
  }, [profile, navigate]);

  if (authLoading || profileLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100 animate-in fade-in duration-300'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-100 animate-in fade-in duration-300'>
        <div className='text-center space-y-6'>
          <div>
            <h1 className='text-4xl font-bold mb-4'>
              Student Management System
            </h1>
            <p className='text-xl text-muted-foreground mb-8'>
              Manage student academic and co-curricular records with ease
            </p>
          </div>
          <div className='space-y-4'>
            <Link to='/auth'>
              <Button size='lg' className='w-full max-w-sm'>
                Sign In / Sign Up
              </Button>
            </Link>
            <p className='text-sm text-muted-foreground'>
              Sign in to access your dashboard and manage certificates
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'>
      <div className='max-w-7xl mx-auto p-6'>
        {/* Hero Section with Waves */}
        <div className='h-96 relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-3xl mb-12'>
          {/* Waves background - fully interactive */}
          <Waves
            lineColor='#fff'
            backgroundColor='rgba(255, 255, 255, 0.2)'
            waveSpeedX={0.02}
            waveSpeedY={0.01}
            waveAmpX={40}
            waveAmpY={20}
            friction={0.9}
            tension={0.01}
            maxCursorMove={120}
            xGap={12}
            yGap={36}
          />

          {/* Text content - positioned above but not blocking background interactions */}
          <div className='relative z-20 text-center px-8 pointer-events-none'>
            <div className='pointer-events-auto'>
              <Badge className='mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30'>
                <Zap className='w-3 h-3 mr-1' />
                Welcome Back
              </Badge>
            </div>
            <h1
              className={cn(
                'md:text-5xl text-3xl text-white font-bold mb-6 leading-tight'
              )}
            >
              Hello, {profile?.full_name?.split(' ')[0] || 'Student'}!
            </h1>
            <p className='text-center mt-2 text-neutral-300 text-xl mb-8 leading-relaxed max-w-3xl'>
              Ready to continue your learning journey? Track your progress,
              manage achievements, and connect with your academic community.
            </p>
            <div className='flex flex-wrap gap-4 justify-center pointer-events-auto'>
              <Button
                size='lg'
                className='bg-white text-slate-900 hover:bg-slate-100 font-semibold'
              >
                <BarChart3 className='w-5 h-5 mr-2' />
                View Dashboard
              </Button>
              <Button
                size='lg'
                className='bg-white/10 backdrop-blur-sm border-2 border-white/40 text-white hover:bg-white/20 hover:text-white hover:border-white/60 shadow-lg'
              >
                <Calendar className='w-5 h-5 mr-2' />
                View Schedule
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'>
          <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 mb-1'>
                    Overall Progress
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>85%</p>
                  <p className='text-xs text-green-600 flex items-center mt-1'>
                    <TrendingUp className='w-3 h-3 mr-1' />
                    +5% this week
                  </p>
                </div>
                <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl group-hover:scale-110 transition-transform'>
                  <TrendingUp className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 mb-1'>
                    Achievements
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>12</p>
                  <p className='text-xs text-purple-600 flex items-center mt-1'>
                    <Star className='w-3 h-3 mr-1' />3 new this month
                  </p>
                </div>
                <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform'>
                  <Award className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 mb-1'>
                    Active Courses
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>8</p>
                  <p className='text-xs text-blue-600 flex items-center mt-1'>
                    <BookOpen className='w-3 h-3 mr-1' />2 completed
                  </p>
                </div>
                <div className='bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl group-hover:scale-110 transition-transform'>
                  <BookOpen className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm'>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600 mb-1'>
                    Study Streak
                  </p>
                  <p className='text-3xl font-bold text-gray-900'>7</p>
                  <p className='text-xs text-orange-600 flex items-center mt-1'>
                    <Clock className='w-3 h-3 mr-1' />
                    days in a row
                  </p>
                </div>
                <div className='bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl group-hover:scale-110 transition-transform'>
                  <Target className='h-6 w-6 text-white' />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Access Section */}
        <div className='mb-12'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 mb-2'>
                Quick Access
              </h2>
              <p className='text-gray-600'>
                Jump into your most important tools and features
              </p>
            </div>
            <Badge variant='outline' className='text-sm'>
              <Globe className='w-3 h-3 mr-1' />
              All Features
            </Badge>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
            {/* Academic Achievements */}
            <Link to='/academic-achievements' className='group'>
              <Card className='h-full border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105'>
                <CardContent className='p-6'>
                  <div className='flex flex-col items-center text-center space-y-4'>
                    <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-2xl group-hover:scale-110 transition-transform'>
                      <GraduationCap className='h-8 w-8 text-white' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-1'>
                        Academic Achievements
                      </h3>
                      <p className='text-sm text-gray-600 mb-3'>
                        Track your academic progress and milestones
                      </p>
                      <div className='flex items-center text-blue-600 text-sm font-medium'>
                        View Details
                        <ArrowRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Resume Generator */}
            <Link to='/resume-generator' className='group'>
              <Card className='h-full border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105'>
                <CardContent className='p-6'>
                  <div className='flex flex-col items-center text-center space-y-4'>
                    <div className='bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-2xl group-hover:scale-110 transition-transform'>
                      <FileText className='h-8 w-8 text-white' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-1'>
                        Resume Generator
                      </h3>
                      <p className='text-sm text-gray-600 mb-3'>
                        Create professional resumes with templates
                      </p>
                      <div className='flex items-center text-green-600 text-sm font-medium'>
                        Get Started
                        <ArrowRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* My Projects */}
            <Link to='/my-projects' className='group'>
              <Card className='h-full border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105'>
                <CardContent className='p-6'>
                  <div className='flex flex-col items-center text-center space-y-4'>
                    <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform'>
                      <FolderOpen className='h-8 w-8 text-white' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-1'>
                        My Projects
                      </h3>
                      <p className='text-sm text-gray-600 mb-3'>
                        Manage and showcase your projects
                      </p>
                      <div className='flex items-center text-purple-600 text-sm font-medium'>
                        View Projects
                        <ArrowRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* My Activities */}
            <Link to='/my-activities' className='group'>
              <Card className='h-full border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105'>
                <CardContent className='p-6'>
                  <div className='flex flex-col items-center text-center space-y-4'>
                    <div className='bg-gradient-to-br from-orange-500 to-orange-600 p-4 rounded-2xl group-hover:scale-110 transition-transform'>
                      <Activity className='h-8 w-8 text-white' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-1'>
                        My Activities
                      </h3>
                      <p className='text-sm text-gray-600 mb-3'>
                        Track your learning activities and progress
                      </p>
                      <div className='flex items-center text-orange-600 text-sm font-medium'>
                        View Activities
                        <ArrowRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Certificate Management */}
            <Link to='/certificate-management' className='group'>
              <Card className='h-full border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105'>
                <CardContent className='p-6'>
                  <div className='flex flex-col items-center text-center space-y-4'>
                    <div className='bg-gradient-to-br from-red-500 to-red-600 p-4 rounded-2xl group-hover:scale-110 transition-transform'>
                      <Award className='h-8 w-8 text-white' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-1'>
                        Certificates
                      </h3>
                      <p className='text-sm text-gray-600 mb-3'>
                        Manage your certificates and credentials
                      </p>
                      <div className='flex items-center text-red-600 text-sm font-medium'>
                        Manage
                        <ArrowRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* My Courses */}
            <Link to='/student-courses' className='group'>
              <Card className='h-full border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group-hover:scale-105'>
                <CardContent className='p-6'>
                  <div className='flex flex-col items-center text-center space-y-4'>
                    <div className='bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-2xl group-hover:scale-110 transition-transform'>
                      <BookOpen className='h-8 w-8 text-white' />
                    </div>
                    <div>
                      <h3 className='font-semibold text-gray-900 mb-1'>
                        My Courses
                      </h3>
                      <p className='text-sm text-gray-600 mb-3'>
                        View courses assigned by your faculty
                      </p>
                      <div className='flex items-center text-purple-600 text-sm font-medium'>
                        View Courses
                        <ArrowRight className='w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform' />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Recent Activity */}
          <Card className='border-0 bg-white/80 backdrop-blur-sm'>
            <CardHeader className='pb-4'>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-3 text-xl'>
                  <div className='bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg'>
                    <Calendar className='h-5 w-5 text-white' />
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
                <div className='flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200'>
                  <div className='bg-green-500 p-2 rounded-full flex-shrink-0'>
                    <Check className='h-4 w-4 text-white' />
                  </div>
                  <div className='flex-1'>
                    <p className='font-semibold text-gray-900'>
                      Completed Web Development Course
                    </p>
                    <p className='text-sm text-gray-600 mb-1'>
                      Advanced JavaScript and React concepts
                    </p>
                    <p className='text-xs text-green-600 font-medium'>
                      2 hours ago
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border border-blue-200'>
                  <div className='bg-blue-500 p-2 rounded-full flex-shrink-0'>
                    <Target className='h-4 w-4 text-white' />
                  </div>
                  <div className='flex-1'>
                    <p className='font-semibold text-gray-900'>New Goal Set</p>
                    <p className='text-sm text-gray-600 mb-1'>
                      Learn React Advanced Patterns
                    </p>
                    <p className='text-xs text-blue-600 font-medium'>
                      1 day ago
                    </p>
                  </div>
                </div>

                <div className='flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border border-purple-200'>
                  <div className='bg-purple-500 p-2 rounded-full flex-shrink-0'>
                    <Award className='h-4 w-4 text-white' />
                  </div>
                  <div className='flex-1'>
                    <p className='font-semibold text-gray-900'>
                      Earned JavaScript Badge
                    </p>
                    <p className='text-sm text-gray-600 mb-1'>
                      Mastered ES6+ features
                    </p>
                    <p className='text-xs text-purple-600 font-medium'>
                      3 days ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
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
                  <Shield className='w-3 h-3 mr-1' />
                  Secure
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <Link to='/community' className='block'>
                  <Button
                    variant='outline'
                    className='w-full justify-start h-12 text-left hover:bg-blue-50 hover:border-blue-200 transition-colors'
                  >
                    <div className='bg-blue-500 p-2 rounded-lg mr-3'>
                      <Users className='h-4 w-4 text-white' />
                    </div>
                    <div>
                      <p className='font-semibold'>Join Community Discussion</p>
                      <p className='text-xs text-gray-600'>
                        Connect with peers and mentors
                      </p>
                    </div>
                    <ArrowRight className='h-4 w-4 ml-auto text-gray-400' />
                  </Button>
                </Link>

                <Link to='/profile' className='block'>
                  <Button
                    variant='outline'
                    className='w-full justify-start h-12 text-left hover:bg-green-50 hover:border-green-200 transition-colors'
                  >
                    <div className='bg-green-500 p-2 rounded-lg mr-3'>
                      <Target className='h-4 w-4 text-white' />
                    </div>
                    <div>
                      <p className='font-semibold'>Update Profile</p>
                      <p className='text-xs text-gray-600'>
                        Keep your information current
                      </p>
                    </div>
                    <ArrowRight className='h-4 w-4 ml-auto text-gray-400' />
                  </Button>
                </Link>

                <Link to='/student/goals' className='block'>
                  <Button
                    variant='outline'
                    className='w-full justify-start h-12 text-left hover:bg-purple-50 hover:border-purple-200 transition-colors'
                  >
                    <div className='bg-purple-500 p-2 rounded-lg mr-3'>
                      <BookOpen className='h-4 w-4 text-white' />
                    </div>
                    <div>
                      <p className='font-semibold'>Set Learning Goals</p>
                      <p className='text-xs text-gray-600'>
                        Plan your learning journey
                      </p>
                    </div>
                    <ArrowRight className='h-4 w-4 ml-auto text-gray-400' />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Home;
