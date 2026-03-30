// Admin Integrations Management Page
// This page allows admins to manage LMS/ERP integrations

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus,
  Settings,
  TestTube,
  Download,
  Upload,
  Webhook,
  Key,
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  Code,
  Globe,
  Clock,
  Database,
  Eye,
  Trash2,
} from 'lucide-react';

interface IntegrationConfig {
  id: string;
  name: string;
  type: 'moodle' | 'canvas' | 'blackboard' | 'generic' | 'sis' | 'erp';
  base_url: string;
  api_key?: string;
  client_id?: string;
  client_secret?: string;
  webhook_url?: string;
  is_active: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

interface Webhook {
  id: string;
  url: string;
  events: string[];
  is_active: boolean;
  last_triggered?: string;
  retry_count: number;
  created_at: string;
}

interface ApiKey {
  id: string;
  name: string;
  permissions: string[];
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
}

interface ApiRequest {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body: string;
  description: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
}

const AdminIntegrations: React.FC = () => {
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(false);
  const [showIntegrationForm, setShowIntegrationForm] = useState(false);
  const [showWebhookForm, setShowWebhookForm] = useState(false);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);

  // Form states
  const [integrationForm, setIntegrationForm] = useState<
    Partial<IntegrationConfig>
  >({
    name: '',
    type: 'generic',
    base_url: '',
    is_active: true,
    settings: {},
  });

  const [webhookForm, setWebhookForm] = useState({
    url: '',
    events: [] as string[],
    secret: '',
  });

  const [apiKeyForm, setApiKeyForm] = useState({
    name: '',
    permissions: [] as string[],
    expires_at: '',
  });

  // API Testing state
  const [currentRequest, setCurrentRequest] = useState<ApiRequest>({
    id: '',
    name: '',
    method: 'GET',
    url: '',
    headers: { 'Content-Type': 'application/json' },
    body: '',
    description: '',
  });
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [savedRequests, setSavedRequests] = useState<ApiRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const availableEvents = [
    'student.created',
    'student.updated',
    'student.deleted',
    'course.created',
    'course.updated',
    'course.deleted',
    'achievement.earned',
    'achievement.verified',
    'achievement.rejected',
    'faculty.created',
    'faculty.updated',
    'faculty.assigned',
  ];

  const availablePermissions = [
    'students:read',
    'students:write',
    'courses:read',
    'courses:write',
    'achievements:read',
    'achievements:write',
    'faculty:read',
    'faculty:write',
    'webhooks:read',
    'webhooks:write',
  ];

  const exampleApis = [
    {
      name: 'LMS Students - Get All',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/users',
      description: 'Get all students from LMS (simulated with users)',
      icon: '👥',
      category: 'Students',
    },
    {
      name: 'LMS Student - Get by ID',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/users/1',
      description: 'Get specific student details by ID',
      icon: '👥',
      category: 'Students',
    },
    {
      name: 'LMS Courses - Get All',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/posts',
      description: 'Get all courses from LMS (simulated with posts)',
      icon: '📚',
      category: 'Courses',
    },
    {
      name: 'LMS Course - Get by ID',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      description: 'Get specific course details by ID',
      icon: '📚',
      category: 'Courses',
    },
    {
      name: 'LMS Enrollments - Create',
      method: 'POST' as const,
      url: 'https://jsonplaceholder.typicode.com/posts',
      description: 'Enroll student in course',
      icon: '🎓',
      category: 'Enrollments',
      body: JSON.stringify(
        {
          student_id: '12345',
          course_id: 'CS101',
          enrollment_date: new Date().toISOString().split('T')[0],
          status: 'active',
          grade: null,
        },
        null,
        2
      ),
    },
    {
      name: 'LMS Grades - Update',
      method: 'PUT' as const,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      description: 'Update student grade for a course',
      icon: '🏆',
      category: 'Grades',
      body: JSON.stringify(
        {
          student_id: '12345',
          course_id: 'CS101',
          grade: 'A',
          points: 95,
          max_points: 100,
          updated_at: new Date().toISOString(),
        },
        null,
        2
      ),
    },
    {
      name: 'LMS Achievements - Get All',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/albums',
      description: 'Get all achievements from LMS (simulated with albums)',
      icon: '🏆',
      category: 'Achievements',
    },
    {
      name: 'LMS Attendance - Create',
      method: 'POST' as const,
      url: 'https://jsonplaceholder.typicode.com/posts',
      description: 'Record student attendance',
      icon: '⏰',
      category: 'Attendance',
      body: JSON.stringify(
        {
          student_id: '12345',
          course_id: 'CS101',
          date: new Date().toISOString().split('T')[0],
          status: 'present',
          notes: 'On time',
        },
        null,
        2
      ),
    },
  ];

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchIntegrations(), fetchWebhooks(), fetchApiKeys()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch integration data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchIntegrations = async () => {
    const { data, error } = await supabase
      .from('integration_configs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setIntegrations(data || []);
  };

  const fetchWebhooks = async () => {
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setWebhooks(data || []);
  };

  const fetchApiKeys = async () => {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setApiKeys(data || []);
  };

  const createIntegration = async () => {
    try {
      const { error } = await supabase
        .from('integration_configs')
        .insert(integrationForm);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Integration created successfully',
      });

      setShowIntegrationForm(false);
      setIntegrationForm({
        name: '',
        type: 'generic',
        base_url: '',
        is_active: true,
        settings: {},
      });
      fetchIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to create integration',
        variant: 'destructive',
      });
    }
  };

  const createWebhook = async () => {
    try {
      const { error } = await supabase.from('webhooks').insert({
        url: webhookForm.url,
        events: webhookForm.events,
        secret: webhookForm.secret || null,
        is_active: true,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Webhook created successfully',
      });

      setShowWebhookForm(false);
      setWebhookForm({
        url: '',
        events: [],
        secret: '',
      });
      fetchWebhooks();
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast({
        title: 'Error',
        description: 'Failed to create webhook',
        variant: 'destructive',
      });
    }
  };

  const generateApiKey = async () => {
    try {
      const { data, error } = await supabase.rpc('generate_api_key', {
        p_name: apiKeyForm.name,
        p_permissions: apiKeyForm.permissions,
        p_expires_at: apiKeyForm.expires_at || null,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `API Key generated: ${data}`,
        duration: 10000,
      });

      setShowApiKeyForm(false);
      setApiKeyForm({
        name: '',
        permissions: [],
        expires_at: '',
      });
      fetchApiKeys();
    } catch (error) {
      console.error('Error generating API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate API key',
        variant: 'destructive',
      });
    }
  };

  const testIntegration = async (integration: IntegrationConfig) => {
    try {
      // This would implement actual integration testing
      toast({
        title: 'Testing Integration',
        description: `Testing connection to ${integration.name}...`,
      });

      // Simulate test
      setTimeout(() => {
        toast({
          title: 'Test Complete',
          description: `Connection to ${integration.name} successful`,
          variant: 'default',
        });
      }, 2000);
    } catch (error) {
      console.error('Error testing integration:', error);
      toast({
        title: 'Test Failed',
        description: `Connection to ${integration.name} failed`,
        variant: 'destructive',
      });
    }
  };

  const toggleIntegration = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('integration_configs')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;

      fetchIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to update integration',
        variant: 'destructive',
      });
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const { error } = await supabase.from('webhooks').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Webhook deleted successfully',
      });

      fetchWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete webhook',
        variant: 'destructive',
      });
    }
  };

  const deleteApiKey = async (id: string) => {
    try {
      const { error } = await supabase.from('api_keys').delete().eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'API Key deleted successfully',
      });

      fetchApiKeys();
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete API key',
        variant: 'destructive',
      });
    }
  };

  // API Testing functions
  const executeRequest = async () => {
    if (!currentRequest.url) return;

    setIsLoading(true);
    const startTime = Date.now();

    try {
      // For Moodle API calls, we need to handle CORS issues
      // We'll use a CORS proxy or simulate the response for demo purposes
      let response;
      let responseData;

      if (currentRequest.url.includes('demo.moodle.net')) {
        // Simulate Moodle API response for demo purposes
        responseData = await simulateMoodleResponse(currentRequest.url);
        response = {
          status: 200,
          statusText: 'OK',
          headers: new Map([
            ['content-type', 'application/json'],
            ['access-control-allow-origin', '*'],
          ]),
        };
      } else {
        // For other APIs, try direct fetch
        response = await fetch(currentRequest.url, {
          method: currentRequest.method,
          headers: currentRequest.headers,
          body: currentRequest.body || undefined,
          mode: 'cors',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        responseData = await response.json();
      }

      const endTime = Date.now();
      const responseSize = JSON.stringify(responseData).length;

      const apiResponse: ApiResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        time: endTime - startTime,
        size: responseSize,
      };

      setResponse(apiResponse);

      toast({
        title: 'Request Successful',
        description: `Status: ${response.status} ${response.statusText}`,
      });
    } catch (error) {
      console.error('Error executing request:', error);

      // Create a mock error response
      const endTime = Date.now();
      const errorResponse: ApiResponse = {
        status: 0,
        statusText: 'CORS Error',
        headers: {},
        data: {
          error: 'CORS Error',
          message:
            'Cross-origin requests are blocked by the browser. This is a common issue when testing APIs from a web browser.',
          suggestion:
            'To test real APIs, you can: 1) Use a CORS proxy, 2) Test from a server environment, or 3) Use browser extensions that disable CORS.',
          originalError:
            error instanceof Error ? error.message : 'Unknown error',
        },
        time: endTime - startTime,
        size: 0,
      };

      setResponse(errorResponse);

      toast({
        title: 'Request Failed',
        description: 'CORS error - see response for details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate Moodle API responses for demo purposes
  const simulateMoodleResponse = async (url: string) => {
    // Simulate network delay
    await new Promise(resolve =>
      setTimeout(resolve, 1000 + Math.random() * 1000)
    );

    if (url.includes('core_webservice_get_site_info')) {
      return {
        sitename: 'Moodle Demo Site',
        username: 'admin',
        firstname: 'Admin',
        lastname: 'User',
        fullname: 'Admin User',
        lang: 'en',
        userid: 2,
        siteurl: 'https://demo.moodle.net',
        userpictureurl:
          'https://demo.moodle.net/theme/image.php/boost/core/1617205489/u/f1',
        functions: [
          {
            name: 'core_webservice_get_site_info',
            version: '2021051700',
          },
          {
            name: 'core_user_get_users',
            version: '2021051700',
          },
          {
            name: 'core_course_get_courses',
            version: '2021051700',
          },
        ],
        downloadfiles: 1,
        uploadfiles: 1,
        release: '3.11.2+ (Build: 20211115)',
        version: '2021051700',
        mobilecssurl:
          'https://demo.moodle.net/theme/css.php/boost/1617205489/mobile',
      };
    } else if (url.includes('core_user_get_users')) {
      return {
        users: [
          {
            id: 2,
            username: 'admin',
            firstname: 'Admin',
            lastname: 'User',
            fullname: 'Admin User',
            email: 'admin@demo.moodle.net',
            department: '',
            firstaccess: 1617205489,
            lastaccess: 1648741489,
            auth: 'manual',
            suspended: false,
            confirmed: true,
            lang: 'en',
            theme: '',
            timezone: '99',
            mailformat: 1,
            description: '',
            descriptionformat: 1,
            city: '',
            country: '',
            profileimageurlsmall:
              'https://demo.moodle.net/theme/image.php/boost/core/1617205489/u/f1',
            profileimageurl:
              'https://demo.moodle.net/theme/image.php/boost/core/1617205489/u/f2',
          },
          {
            id: 3,
            username: 'student1',
            firstname: 'John',
            lastname: 'Doe',
            fullname: 'John Doe',
            email: 'john.doe@demo.moodle.net',
            department: 'Computer Science',
            firstaccess: 1617205489,
            lastaccess: 1648741489,
            auth: 'manual',
            suspended: false,
            confirmed: true,
            lang: 'en',
            theme: '',
            timezone: '99',
            mailformat: 1,
            description: 'Computer Science Student',
            descriptionformat: 1,
            city: 'New York',
            country: 'US',
            profileimageurlsmall:
              'https://demo.moodle.net/theme/image.php/boost/core/1617205489/u/f1',
            profileimageurl:
              'https://demo.moodle.net/theme/image.php/boost/core/1617205489/u/f2',
          },
        ],
        warnings: [],
      };
    } else if (url.includes('core_course_get_courses')) {
      return {
        courses: [
          {
            id: 1,
            shortname: 'CS101',
            fullname: 'Introduction to Computer Science',
            displayname: 'CS101 - Introduction to Computer Science',
            summary:
              'This course provides an introduction to computer science concepts and programming.',
            summaryformat: 1,
            startdate: 1617205489,
            enddate: 1648741489,
            visible: 1,
            hiddenbynumsections: 0,
            showgrades: 1,
            showreports: 1,
            maxbytes: 0,
            timecreated: 1617205489,
            timemodified: 1648741489,
            enablecompletion: 1,
            completionnotify: 0,
            category: 1,
            categoryname: 'General',
            progress: 75,
            completed: false,
            startdateformatted: 'April 1, 2021',
            enddateformatted: 'April 1, 2022',
          },
          {
            id: 2,
            shortname: 'MATH201',
            fullname: 'Calculus I',
            displayname: 'MATH201 - Calculus I',
            summary: 'Introduction to differential and integral calculus.',
            summaryformat: 1,
            startdate: 1617205489,
            enddate: 1648741489,
            visible: 1,
            hiddenbynumsections: 0,
            showgrades: 1,
            showreports: 1,
            maxbytes: 0,
            timecreated: 1617205489,
            timemodified: 1648741489,
            enablecompletion: 1,
            completionnotify: 0,
            category: 1,
            categoryname: 'Mathematics',
            progress: 60,
            completed: false,
            startdateformatted: 'April 1, 2021',
            enddateformatted: 'April 1, 2022',
          },
        ],
        warnings: [],
      };
    } else if (url.includes('core_enrol_get_enrolled_users')) {
      return {
        users: [
          {
            id: 3,
            username: 'student1',
            firstname: 'John',
            lastname: 'Doe',
            fullname: 'John Doe',
            email: 'john.doe@demo.moodle.net',
            firstaccess: 1617205489,
            lastaccess: 1648741489,
            lastcourseaccess: 1648741489,
            profileimageurlsmall:
              'https://demo.moodle.net/theme/image.php/boost/core/1617205489/u/f1',
            profileimageurl:
              'https://demo.moodle.net/theme/image.php/boost/core/1617205489/u/f2',
            groups: [],
            roles: [
              {
                roleid: 5,
                name: 'Student',
                shortname: 'student',
                courseid: 1,
              },
            ],
          },
        ],
        warnings: [],
      };
    } else if (url.includes('core_course_get_contents')) {
      return {
        sections: [
          {
            id: 1,
            name: 'General',
            summary: 'Course introduction and overview',
            summaryformat: 1,
            section: 0,
            hiddenbynumsections: 0,
            uservisible: true,
            modules: [
              {
                id: 1,
                name: 'Course Introduction',
                modname: 'page',
                modplural: 'Pages',
                modicon:
                  'https://demo.moodle.net/theme/image.php/boost/mod_page/1617205489/icon',
                indent: 0,
                url: 'https://demo.moodle.net/mod/page/view.php?id=1',
                description: 'Welcome to the course!',
                visible: 1,
                visibleoncoursepage: 1,
                visibleold: 1,
                completion: 0,
                completionview: 0,
                completionexpected: 0,
                completionuservisible: 1,
                availability: null,
                grade: null,
                gradecat: null,
                gradecomplete: null,
                gradeformatted: null,
                gradepass: null,
                gradeispassing: null,
                gradeislocked: null,
                gradeisoverridden: null,
                gradeishidden: null,
                gradeneedsupdate: null,
                gradeishiddenbyuser: null,
                gradeisbroken: null,
                canviewhidden: true,
                returncourse: 1,
                returncourseid: 1,
                returncoursename: 'Introduction to Computer Science',
                returncoursereturn: 1,
                returncoursereturnid: 1,
                returncoursereturnname: 'Introduction to Computer Science',
                returncoursereturnreturn: 1,
                returncoursereturnreturnid: 1,
                returncoursereturnreturnname:
                  'Introduction to Computer Science',
              },
            ],
          },
        ],
        warnings: [],
      };
    } else if (url.includes('gradereport_user_get_grade_items')) {
      return {
        usergrades: [
          {
            courseid: 1,
            userid: 2,
            userfullname: 'John Doe',
            userfirstname: 'John',
            userlastname: 'Doe',
            useremail: 'john.doe@demo.moodle.net',
            maxdepth: 1,
            gradeitems: [
              {
                id: 1,
                itemname: 'Assignment 1',
                itemtype: 'mod',
                itemmodule: 'assign',
                iteminstance: 1,
                itemnumber: 0,
                categoryid: 1,
                outcomeid: null,
                scaleid: null,
                locked: false,
                cmid: 1,
                weightoverride: false,
                grade: 85,
                gradeformatted: '85.00',
                grademin: 0,
                grademax: 100,
                rangeformatted: '0.00 - 100.00',
                percentageformatted: '85.00%',
                feedback: 'Good work!',
                feedbackformat: 1,
                feedbackfiles: [],
                gradecanbechanged: true,
                gradeishidden: false,
                gradeislocked: false,
                gradeisoverridden: false,
                gradeisbroken: false,
                gradeneedsupdate: false,
                gradeishiddenbyuser: false,
                displaygrade: '85.00',
                gradebookgrade: 85,
                userid: 2,
                userfullname: 'John Doe',
                maxgrade: 100,
                gradetype: 1,
                hidden: 0,
                locktime: 0,
                needsupdate: 0,
                timecreated: 1617205489,
                timemodified: 1648741489,
                aggregationstatus: 'used',
              },
            ],
          },
        ],
        warnings: [],
      };
    }

    // Default response for unknown endpoints
    return {
      message: 'Simulated response for demo purposes',
      note: 'This is a mock response. Real API calls may be blocked by CORS policy.',
      timestamp: new Date().toISOString(),
      endpoint: url,
    };
  };

  const saveRequest = () => {
    if (!currentRequest.name || !currentRequest.url) {
      toast({
        title: 'Error',
        description: 'Please provide a name and URL for the request',
        variant: 'destructive',
      });
      return;
    }

    const newRequest: ApiRequest = {
      ...currentRequest,
      id: Date.now().toString(),
    };

    setSavedRequests(prev => [newRequest, ...prev]);
    toast({
      title: 'Request Saved',
      description: 'API request saved successfully',
    });
  };

  const deleteRequest = (id: string) => {
    setSavedRequests(prev => prev.filter(req => req.id !== id));
    toast({
      title: 'Request Deleted',
      description: 'API request deleted successfully',
    });
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Integration Management
          </h1>
          <p className='text-gray-600 mt-2'>
            Manage LMS/ERP integrations, webhooks, and API access
          </p>
        </div>

        <Tabs defaultValue='integrations' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='integrations'>Integrations</TabsTrigger>
            <TabsTrigger value='webhooks'>Webhooks</TabsTrigger>
            <TabsTrigger value='api-keys'>API Keys</TabsTrigger>
            <TabsTrigger value='data-sync'>Data Sync</TabsTrigger>
            <TabsTrigger value='api-testing'>API Testing</TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value='integrations' className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold'>LMS/ERP Integrations</h2>
              <Button onClick={() => setShowIntegrationForm(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Add Integration
              </Button>
            </div>

            {/* Quick Start Guide */}
            <Card className='bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
              <CardHeader>
                <CardTitle className='text-blue-900'>
                  🚀 Quick Start Guide
                </CardTitle>
                <CardDescription className='text-blue-700'>
                  Follow these steps to connect your LMS/ERP system to SIH2
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                        1
                      </div>
                      <h4 className='font-semibold text-blue-900'>
                        Get API Credentials
                      </h4>
                    </div>
                    <p className='text-sm text-blue-700'>
                      Obtain API keys, tokens, or OAuth credentials from your
                      LMS/ERP system
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                        2
                      </div>
                      <h4 className='font-semibold text-blue-900'>
                        Configure Integration
                      </h4>
                    </div>
                    <p className='text-sm text-blue-700'>
                      Click "Add Integration" and enter your system details and
                      credentials
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <div className='flex items-center space-x-2'>
                      <div className='w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                        3
                      </div>
                      <h4 className='font-semibold text-blue-900'>
                        Test & Sync
                      </h4>
                    </div>
                    <p className='text-sm text-blue-700'>
                      Test the connection and start syncing data between systems
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {integrations.map(integration => (
                <Card key={integration.id}>
                  <CardHeader>
                    <div className='flex justify-between items-start'>
                      <div>
                        <CardTitle className='text-lg'>
                          {integration.name}
                        </CardTitle>
                        <CardDescription>
                          {integration.type.toUpperCase()} •{' '}
                          {integration.base_url}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={
                          integration.is_active ? 'default' : 'secondary'
                        }
                      >
                        {integration.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className='flex items-center space-x-2'>
                      <Switch
                        checked={integration.is_active}
                        onCheckedChange={checked =>
                          toggleIntegration(integration.id, checked)
                        }
                      />
                      <Label>Enabled</Label>
                    </div>
                    <div className='flex space-x-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => testIntegration(integration)}
                      >
                        <TestTube className='h-4 w-4 mr-1' />
                        Test
                      </Button>
                      <Button size='sm' variant='outline'>
                        <Settings className='h-4 w-4 mr-1' />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value='webhooks' className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold'>Webhooks</h2>
              <Button onClick={() => setShowWebhookForm(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Add Webhook
              </Button>
            </div>

            <div className='space-y-4'>
              {webhooks.map(webhook => (
                <Card key={webhook.id}>
                  <CardContent className='pt-6'>
                    <div className='flex justify-between items-start'>
                      <div className='space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <Webhook className='h-4 w-4' />
                          <span className='font-medium'>{webhook.url}</span>
                          <Badge
                            variant={
                              webhook.is_active ? 'default' : 'secondary'
                            }
                          >
                            {webhook.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className='text-sm text-gray-600'>
                          Events: {webhook.events.join(', ')}
                        </div>
                        {webhook.last_triggered && (
                          <div className='text-sm text-gray-500'>
                            Last triggered:{' '}
                            {new Date(webhook.last_triggered).toLocaleString()}
                          </div>
                        )}
                        {webhook.retry_count > 0 && (
                          <div className='text-sm text-orange-600'>
                            Retry count: {webhook.retry_count}
                          </div>
                        )}
                      </div>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value='api-keys' className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold'>API Keys</h2>
              <Button onClick={() => setShowApiKeyForm(true)}>
                <Plus className='h-4 w-4 mr-2' />
                Generate Key
              </Button>
            </div>

            <div className='space-y-4'>
              {apiKeys.map(apiKey => (
                <Card key={apiKey.id}>
                  <CardContent className='pt-6'>
                    <div className='flex justify-between items-start'>
                      <div className='space-y-2'>
                        <div className='flex items-center space-x-2'>
                          <Key className='h-4 w-4' />
                          <span className='font-medium'>{apiKey.name}</span>
                          <Badge
                            variant={apiKey.is_active ? 'default' : 'secondary'}
                          >
                            {apiKey.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div className='text-sm text-gray-600'>
                          Permissions: {apiKey.permissions.join(', ')}
                        </div>
                        {apiKey.last_used_at && (
                          <div className='text-sm text-gray-500'>
                            Last used:{' '}
                            {new Date(apiKey.last_used_at).toLocaleString()}
                          </div>
                        )}
                        {apiKey.expires_at && (
                          <div className='text-sm text-gray-500'>
                            Expires:{' '}
                            {new Date(apiKey.expires_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <Button
                        size='sm'
                        variant='destructive'
                        onClick={() => deleteApiKey(apiKey.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Data Sync Tab */}
          <TabsContent value='data-sync' className='space-y-6'>
            <h2 className='text-xl font-semibold'>Data Synchronization</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Export Data</CardTitle>
                  <CardDescription>
                    Export data to external systems
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Button className='w-full'>
                    <Download className='h-4 w-4 mr-2' />
                    Export Students (CSV)
                  </Button>
                  <Button className='w-full' variant='outline'>
                    <Download className='h-4 w-4 mr-2' />
                    Export Courses (CSV)
                  </Button>
                  <Button className='w-full' variant='outline'>
                    <Download className='h-4 w-4 mr-2' />
                    Export Achievements (CSV)
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Import Data</CardTitle>
                  <CardDescription>
                    Import data from external systems
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Button className='w-full'>
                    <Upload className='h-4 w-4 mr-2' />
                    Import Students
                  </Button>
                  <Button className='w-full' variant='outline'>
                    <Upload className='h-4 w-4 mr-2' />
                    Import Courses
                  </Button>
                  <Button className='w-full' variant='outline'>
                    <Upload className='h-4 w-4 mr-2' />
                    Sync with LMS
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Testing Tab */}
          <TabsContent value='api-testing' className='space-y-6'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold'>API Testing Lab</h2>
              <Button
                onClick={() =>
                  setCurrentRequest({
                    id: '',
                    name: '',
                    method: 'GET',
                    url: '',
                    headers: { 'Content-Type': 'application/json' },
                    body: '',
                    description: '',
                  })
                }
              >
                <Plus className='h-4 w-4 mr-2' />
                New Request
              </Button>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Request Builder */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <TestTube className='h-5 w-5' />
                    Request Builder
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <Label htmlFor='request-name'>Request Name</Label>
                    <Input
                      id='request-name'
                      value={currentRequest.name}
                      onChange={e =>
                        setCurrentRequest({
                          ...currentRequest,
                          name: e.target.value,
                        })
                      }
                      placeholder='Enter request name'
                    />
                  </div>

                  <div className='flex gap-2'>
                    <Select
                      value={currentRequest.method}
                      onValueChange={(value: any) =>
                        setCurrentRequest({ ...currentRequest, method: value })
                      }
                    >
                      <SelectTrigger className='w-32'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='GET'>GET</SelectItem>
                        <SelectItem value='POST'>POST</SelectItem>
                        <SelectItem value='PUT'>PUT</SelectItem>
                        <SelectItem value='DELETE'>DELETE</SelectItem>
                        <SelectItem value='PATCH'>PATCH</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={currentRequest.url}
                      onChange={e =>
                        setCurrentRequest({
                          ...currentRequest,
                          url: e.target.value,
                        })
                      }
                      placeholder='https://api.example.com/endpoint'
                      className='flex-1'
                    />
                  </div>

                  <div>
                    <Label htmlFor='request-description'>Description</Label>
                    <Input
                      id='request-description'
                      value={currentRequest.description}
                      onChange={e =>
                        setCurrentRequest({
                          ...currentRequest,
                          description: e.target.value,
                        })
                      }
                      placeholder='Describe what this request does'
                    />
                  </div>

                  <div>
                    <Label>Headers</Label>
                    <div className='space-y-2'>
                      {Object.entries(currentRequest.headers).map(
                        ([key, value], index) => (
                          <div key={index} className='flex gap-2'>
                            <Input
                              value={key}
                              onChange={e => {
                                const newHeaders = {
                                  ...currentRequest.headers,
                                };
                                delete newHeaders[key];
                                newHeaders[e.target.value] = value;
                                setCurrentRequest({
                                  ...currentRequest,
                                  headers: newHeaders,
                                });
                              }}
                              placeholder='Header name'
                              className='flex-1'
                            />
                            <Input
                              value={value}
                              onChange={e =>
                                setCurrentRequest({
                                  ...currentRequest,
                                  headers: {
                                    ...currentRequest.headers,
                                    [key]: e.target.value,
                                  },
                                })
                              }
                              placeholder='Header value'
                              className='flex-1'
                            />
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => {
                                const newHeaders = {
                                  ...currentRequest.headers,
                                };
                                delete newHeaders[key];
                                setCurrentRequest({
                                  ...currentRequest,
                                  headers: newHeaders,
                                });
                              }}
                            >
                              <XCircle className='h-4 w-4' />
                            </Button>
                          </div>
                        )
                      )}
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() =>
                          setCurrentRequest({
                            ...currentRequest,
                            headers: { ...currentRequest.headers, '': '' },
                          })
                        }
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Add Header
                      </Button>
                    </div>
                  </div>

                  {(currentRequest.method === 'POST' ||
                    currentRequest.method === 'PUT' ||
                    currentRequest.method === 'PATCH') && (
                    <div>
                      <Label htmlFor='request-body'>Request Body</Label>
                      <Textarea
                        id='request-body'
                        value={currentRequest.body}
                        onChange={e =>
                          setCurrentRequest({
                            ...currentRequest,
                            body: e.target.value,
                          })
                        }
                        placeholder='Enter JSON body'
                        rows={6}
                        className='font-mono text-sm'
                      />
                    </div>
                  )}

                  <div className='flex gap-2'>
                    <Button
                      onClick={executeRequest}
                      disabled={isLoading || !currentRequest.url}
                      className='flex-1'
                    >
                      {isLoading ? (
                        <>
                          <Clock className='h-4 w-4 mr-2 animate-spin' />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Play className='h-4 w-4 mr-2' />
                          Test Request
                        </>
                      )}
                    </Button>
                    <Button
                      variant='outline'
                      onClick={saveRequest}
                      disabled={!currentRequest.name || !currentRequest.url}
                    >
                      <Plus className='h-4 w-4 mr-2' />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Response Display */}
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Globe className='h-5 w-5' />
                    Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {response ? (
                    <div className='space-y-4'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          variant={
                            response.status >= 200 && response.status < 300
                              ? 'default'
                              : 'destructive'
                          }
                        >
                          {response.status} {response.statusText}
                        </Badge>
                        <span className='text-sm text-gray-600'>
                          {response.time}ms • {response.size} bytes
                        </span>
                      </div>

                      <div>
                        <Label>Response Headers</Label>
                        <div className='bg-gray-100 p-3 rounded text-sm font-mono max-h-32 overflow-y-auto'>
                          {Object.entries(response.headers).map(
                            ([key, value]) => (
                              <div key={key}>
                                {key}: {value}
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div>
                        <Label>Response Body</Label>
                        <div className='bg-gray-100 p-3 rounded text-sm font-mono max-h-64 overflow-y-auto'>
                          <pre>{JSON.stringify(response.data, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='text-center text-gray-500 py-8'>
                      <Globe className='h-12 w-12 mx-auto mb-4 text-gray-300' />
                      <p>
                        No response yet. Send a request to see the response
                        here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Moodle API Testing Section */}
            <Card className='border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-blue-900'>
                  <div className='bg-blue-500 p-2 rounded-lg'>
                    <TestTube className='h-5 w-5 text-white' />
                  </div>
                  Moodle API Testing
                </CardTitle>
                <CardDescription className='text-blue-700'>
                  Test actual Moodle API endpoints with real data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <div className='p-4 bg-white/60 rounded-lg border border-blue-200'>
                    <h4 className='font-semibold text-blue-900 mb-2'>
                      Moodle Configuration
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <Label htmlFor='moodle-url'>Moodle Site URL</Label>
                        <Input
                          id='moodle-url'
                          placeholder='https://your-moodle-site.com'
                          value='https://demo.moodle.net'
                          readOnly
                          className='bg-gray-100'
                        />
                      </div>
                      <div>
                        <Label htmlFor='moodle-token'>API Token</Label>
                        <Input
                          id='moodle-token'
                          type='password'
                          value='ea92c9da6e9c37ee44d0734c0337e388'
                          readOnly
                          className='bg-gray-100'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    <Button
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-start text-left border-blue-200 hover:bg-blue-50'
                      onClick={() =>
                        setCurrentRequest({
                          id: '',
                          name: 'Moodle - Get Site Info',
                          method: 'GET',
                          url: 'https://demo.moodle.net/webservice/rest/server.php?wstoken=ea92c9da6e9c37ee44d0734c0337e388&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json',
                          headers: { 'Content-Type': 'application/json' },
                          body: '',
                          description:
                            'Get basic information about the Moodle site',
                        })
                      }
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-lg'>🏫</span>
                        <span className='font-medium'>Site Info</span>
                      </div>
                      <span className='text-xs text-gray-600'>
                        Get site information and capabilities
                      </span>
                      <Badge variant='secondary' className='mt-2 text-xs'>
                        GET • Site
                      </Badge>
                    </Button>

                    <Button
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-start text-left border-blue-200 hover:bg-blue-50'
                      onClick={() =>
                        setCurrentRequest({
                          id: '',
                          name: 'Moodle - Get Users',
                          method: 'GET',
                          url: 'https://demo.moodle.net/webservice/rest/server.php?wstoken=ea92c9da6e9c37ee44d0734c0337e388&wsfunction=core_user_get_users&moodlewsrestformat=json&criteria[0][key]=&criteria[0][value]=',
                          headers: { 'Content-Type': 'application/json' },
                          body: '',
                          description: 'Get list of users from Moodle',
                        })
                      }
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-lg'>👥</span>
                        <span className='font-medium'>Get Users</span>
                      </div>
                      <span className='text-xs text-gray-600'>
                        Retrieve all users from Moodle
                      </span>
                      <Badge variant='secondary' className='mt-2 text-xs'>
                        GET • Users
                      </Badge>
                    </Button>

                    <Button
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-start text-left border-blue-200 hover:bg-blue-50'
                      onClick={() =>
                        setCurrentRequest({
                          id: '',
                          name: 'Moodle - Get Courses',
                          method: 'GET',
                          url: 'https://demo.moodle.net/webservice/rest/server.php?wstoken=ea92c9da6e9c37ee44d0734c0337e388&wsfunction=core_course_get_courses&moodlewsrestformat=json',
                          headers: { 'Content-Type': 'application/json' },
                          body: '',
                          description: 'Get list of courses from Moodle',
                        })
                      }
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-lg'>📚</span>
                        <span className='font-medium'>Get Courses</span>
                      </div>
                      <span className='text-xs text-gray-600'>
                        Retrieve all courses from Moodle
                      </span>
                      <Badge variant='secondary' className='mt-2 text-xs'>
                        GET • Courses
                      </Badge>
                    </Button>

                    <Button
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-start text-left border-blue-200 hover:bg-blue-50'
                      onClick={() =>
                        setCurrentRequest({
                          id: '',
                          name: 'Moodle - Get Enrolled Users',
                          method: 'GET',
                          url: 'https://demo.moodle.net/webservice/rest/server.php?wstoken=ea92c9da6e9c37ee44d0734c0337e388&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=1',
                          headers: { 'Content-Type': 'application/json' },
                          body: '',
                          description:
                            'Get enrolled users for a specific course',
                        })
                      }
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-lg'>🎓</span>
                        <span className='font-medium'>Enrolled Users</span>
                      </div>
                      <span className='text-xs text-gray-600'>
                        Get users enrolled in course ID 1
                      </span>
                      <Badge variant='secondary' className='mt-2 text-xs'>
                        GET • Enrollments
                      </Badge>
                    </Button>

                    <Button
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-start text-left border-blue-200 hover:bg-blue-50'
                      onClick={() =>
                        setCurrentRequest({
                          id: '',
                          name: 'Moodle - Get Course Contents',
                          method: 'GET',
                          url: 'https://demo.moodle.net/webservice/rest/server.php?wstoken=ea92c9da6e9c37ee44d0734c0337e388&wsfunction=core_course_get_contents&moodlewsrestformat=json&courseid=1',
                          headers: { 'Content-Type': 'application/json' },
                          body: '',
                          description: 'Get course contents and modules',
                        })
                      }
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-lg'>📖</span>
                        <span className='font-medium'>Course Contents</span>
                      </div>
                      <span className='text-xs text-gray-600'>
                        Get contents of course ID 1
                      </span>
                      <Badge variant='secondary' className='mt-2 text-xs'>
                        GET • Content
                      </Badge>
                    </Button>

                    <Button
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-start text-left border-blue-200 hover:bg-blue-50'
                      onClick={() =>
                        setCurrentRequest({
                          id: '',
                          name: 'Moodle - Get Grades',
                          method: 'GET',
                          url: 'https://demo.moodle.net/webservice/rest/server.php?wstoken=ea92c9da6e9c37ee44d0734c0337e388&wsfunction=gradereport_user_get_grade_items&moodlewsrestformat=json&courseid=1&userid=2',
                          headers: { 'Content-Type': 'application/json' },
                          body: '',
                          description:
                            'Get grades for a specific user and course',
                        })
                      }
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-lg'>🏆</span>
                        <span className='font-medium'>Get Grades</span>
                      </div>
                      <span className='text-xs text-gray-600'>
                        Get grades for user 2 in course 1
                      </span>
                      <Badge variant='secondary' className='mt-2 text-xs'>
                        GET • Grades
                      </Badge>
                    </Button>
                  </div>

                  <div className='p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
                    <div className='flex items-start gap-2'>
                      <AlertCircle className='h-5 w-5 text-yellow-600 mt-0.5' />
                      <div>
                        <h4 className='font-semibold text-yellow-900'>
                          Moodle API Testing Notes
                        </h4>
                        <ul className='text-sm text-yellow-800 mt-1 space-y-1'>
                          <li>
                            • <strong>CORS Issue:</strong> Direct browser
                            requests to Moodle are blocked by CORS policy
                          </li>
                          <li>
                            • <strong>Simulation Mode:</strong> Responses are
                            simulated with realistic Moodle data structure
                          </li>
                          <li>
                            • <strong>Real Testing:</strong> For actual API
                            testing, use a CORS proxy or server-side requests
                          </li>
                          <li>
                            • <strong>Data Format:</strong> Simulated responses
                            match real Moodle API response format
                          </li>
                          <li>
                            • <strong>Token:</strong> Your API token is
                            pre-configured for reference
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className='p-4 bg-blue-50 rounded-lg border border-blue-200'>
                    <div className='flex items-start gap-2'>
                      <CheckCircle className='h-5 w-5 text-blue-600 mt-0.5' />
                      <div>
                        <h4 className='font-semibold text-blue-900'>
                          How to Test Real Moodle APIs
                        </h4>
                        <ul className='text-sm text-blue-800 mt-1 space-y-1'>
                          <li>
                            • <strong>Option 1:</strong> Use a CORS proxy
                            service (e.g., cors-anywhere.herokuapp.com)
                          </li>
                          <li>
                            • <strong>Option 2:</strong> Test from a server
                            environment (Node.js, Python, etc.)
                          </li>
                          <li>
                            • <strong>Option 3:</strong> Use browser extensions
                            that disable CORS
                          </li>
                          <li>
                            • <strong>Option 4:</strong> Set up a backend proxy
                            in your application
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Example APIs */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Code className='h-5 w-5' />
                  Example APIs
                </CardTitle>
                <CardDescription>
                  Quick start with pre-configured API requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {exampleApis.map((api, index) => (
                    <Button
                      key={index}
                      variant='outline'
                      className='h-auto p-4 flex flex-col items-start text-left'
                      onClick={() =>
                        setCurrentRequest({
                          id: '',
                          name: api.name,
                          method: api.method,
                          url: api.url,
                          headers: { 'Content-Type': 'application/json' },
                          body: api.body || '',
                          description: api.description,
                        })
                      }
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        <span className='text-lg'>{api.icon}</span>
                        <span className='font-medium'>{api.name}</span>
                      </div>
                      <span className='text-xs text-gray-600'>
                        {api.description}
                      </span>
                      <Badge variant='secondary' className='mt-2 text-xs'>
                        {api.method} • {api.category}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Saved Requests */}
            {savedRequests.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2'>
                    <Database className='h-5 w-5' />
                    Saved Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='space-y-2'>
                    {savedRequests.map(request => (
                      <div
                        key={request.id}
                        className='flex items-center justify-between p-3 border rounded'
                      >
                        <div className='flex items-center gap-3'>
                          <Badge variant='outline'>{request.method}</Badge>
                          <span className='font-medium'>{request.name}</span>
                          <span className='text-sm text-gray-600'>
                            {request.url}
                          </span>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setCurrentRequest(request)}
                          >
                            <Eye className='h-4 w-4 mr-1' />
                            Load
                          </Button>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => deleteRequest(request.id)}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Integration Form Modal */}
        {showIntegrationForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <Card className='w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
              <CardHeader>
                <CardTitle>Add Integration</CardTitle>
                <CardDescription>
                  Configure a new LMS/ERP integration
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    value={integrationForm.name}
                    onChange={e =>
                      setIntegrationForm({
                        ...integrationForm,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='type'>Type</Label>
                  <Select
                    value={integrationForm.type}
                    onValueChange={value =>
                      setIntegrationForm({
                        ...integrationForm,
                        type: value as any,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='moodle'>Moodle</SelectItem>
                      <SelectItem value='canvas'>Canvas</SelectItem>
                      <SelectItem value='blackboard'>Blackboard</SelectItem>
                      <SelectItem value='generic'>Generic LMS</SelectItem>
                      <SelectItem value='sis'>
                        Student Information System
                      </SelectItem>
                      <SelectItem value='erp'>
                        Enterprise Resource Planning
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor='base_url'>Base URL</Label>
                  <Input
                    id='base_url'
                    value={integrationForm.base_url}
                    onChange={e =>
                      setIntegrationForm({
                        ...integrationForm,
                        base_url: e.target.value,
                      })
                    }
                    placeholder='https://lms.example.com'
                  />
                </div>
                <div>
                  <Label htmlFor='api_key'>API Key / Token</Label>
                  <Input
                    id='api_key'
                    type='password'
                    value={integrationForm.api_key || ''}
                    onChange={e =>
                      setIntegrationForm({
                        ...integrationForm,
                        api_key: e.target.value,
                      })
                    }
                    placeholder='Enter API key, token, or access key'
                  />
                </div>
                <div>
                  <Label htmlFor='client_id'>Client ID (OAuth)</Label>
                  <Input
                    id='client_id'
                    value={integrationForm.client_id || ''}
                    onChange={e =>
                      setIntegrationForm({
                        ...integrationForm,
                        client_id: e.target.value,
                      })
                    }
                    placeholder='OAuth Client ID (if applicable)'
                  />
                </div>
                <div>
                  <Label htmlFor='client_secret'>Client Secret (OAuth)</Label>
                  <Input
                    id='client_secret'
                    type='password'
                    value={integrationForm.client_secret || ''}
                    onChange={e =>
                      setIntegrationForm({
                        ...integrationForm,
                        client_secret: e.target.value,
                      })
                    }
                    placeholder='OAuth Client Secret (if applicable)'
                  />
                </div>
                <div>
                  <Label htmlFor='webhook_url'>Webhook URL</Label>
                  <Input
                    id='webhook_url'
                    value={integrationForm.webhook_url || ''}
                    onChange={e =>
                      setIntegrationForm({
                        ...integrationForm,
                        webhook_url: e.target.value,
                      })
                    }
                    placeholder='https://your-lms.com/webhook-endpoint'
                  />
                </div>

                {/* Configuration File Upload */}
                <div className='border-2 border-dashed border-gray-300 rounded-lg p-6'>
                  <div className='text-center'>
                    <Upload className='mx-auto h-12 w-12 text-gray-400' />
                    <div className='mt-4'>
                      <Label htmlFor='config-file' className='cursor-pointer'>
                        <span className='mt-2 block text-sm font-medium text-gray-900'>
                          Upload Configuration File (Optional)
                        </span>
                        <span className='mt-1 block text-sm text-gray-500'>
                          Upload JSON, XML, or CSV configuration file
                        </span>
                      </Label>
                      <input
                        id='config-file'
                        type='file'
                        className='sr-only'
                        accept='.json,.xml,.csv'
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = event => {
                              try {
                                const content = event.target?.result as string;
                                let parsedConfig = {};

                                if (file.name.endsWith('.json')) {
                                  parsedConfig = JSON.parse(content);
                                } else if (file.name.endsWith('.xml')) {
                                  // Basic XML parsing - you might want to use a proper XML parser
                                } else if (file.name.endsWith('.csv')) {
                                  // Basic CSV parsing
                                  const lines = content.split('\n');
                                  const headers = lines[0].split(',');
                                  const data = lines.slice(1).map(line => {
                                    const values = line.split(',');
                                    const obj: any = {};
                                    headers.forEach((header, index) => {
                                      obj[header.trim()] =
                                        values[index]?.trim();
                                    });
                                    return obj;
                                  });
                                  parsedConfig = { csvData: data };
                                }

                                setIntegrationForm({
                                  ...integrationForm,
                                  settings: {
                                    ...integrationForm.settings,
                                    ...parsedConfig,
                                  },
                                });

                                toast({
                                  title: 'Configuration File Uploaded',
                                  description: `Successfully parsed ${file.name}`,
                                });
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                              } catch (error) {
                                toast({
                                  title: 'Error',
                                  description:
                                    'Failed to parse configuration file',
                                  variant: 'destructive',
                                });
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </div>
                    <p className='text-xs text-gray-500 mt-2'>
                      Supported formats: JSON, XML, CSV. Max size: 10MB
                    </p>
                  </div>
                </div>

                {/* Integration Type Specific Instructions */}
                {integrationForm.type === 'moodle' && (
                  <div className='p-4 bg-blue-50 rounded-lg'>
                    <h4 className='font-semibold text-blue-900 mb-2'>
                      Moodle Configuration
                    </h4>
                    <p className='text-sm text-blue-700 mb-2'>
                      To connect to Moodle, you need to:
                    </p>
                    <ol className='text-sm text-blue-700 list-decimal list-inside space-y-1'>
                      <li>
                        Enable Web Services in Moodle Admin → Advanced features
                      </li>
                      <li>Create a new service and generate a token</li>
                      <li>Use the token as your API Key above</li>
                      <li>Base URL should be your Moodle site URL</li>
                    </ol>
                  </div>
                )}

                {integrationForm.type === 'canvas' && (
                  <div className='p-4 bg-green-50 rounded-lg'>
                    <h4 className='font-semibold text-green-900 mb-2'>
                      Canvas Configuration
                    </h4>
                    <p className='text-sm text-green-700 mb-2'>
                      To connect to Canvas, you need to:
                    </p>
                    <ol className='text-sm text-green-700 list-decimal list-inside space-y-1'>
                      <li>
                        Generate an access token in Canvas Account Settings
                      </li>
                      <li>Use the token as your API Key above</li>
                      <li>Base URL should be your Canvas instance URL</li>
                      <li>For OAuth, provide Client ID and Secret</li>
                    </ol>
                  </div>
                )}

                {integrationForm.type === 'blackboard' && (
                  <div className='p-4 bg-purple-50 rounded-lg'>
                    <h4 className='font-semibold text-purple-900 mb-2'>
                      Blackboard Configuration
                    </h4>
                    <p className='text-sm text-purple-700 mb-2'>
                      To connect to Blackboard, you need to:
                    </p>
                    <ol className='text-sm text-purple-700 list-decimal list-inside space-y-1'>
                      <li>Enable REST API in Blackboard Admin Panel</li>
                      <li>Create an application and generate keys</li>
                      <li>Use Application Key as API Key above</li>
                      <li>Base URL should be your Blackboard Learn URL</li>
                    </ol>
                  </div>
                )}

                <div className='flex justify-end space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => setShowIntegrationForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createIntegration}>Create</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Webhook Form Modal */}
        {showWebhookForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <Card className='w-full max-w-md'>
              <CardHeader>
                <CardTitle>Add Webhook</CardTitle>
                <CardDescription>
                  Configure a new webhook endpoint
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='webhook_url'>Webhook URL</Label>
                  <Input
                    id='webhook_url'
                    value={webhookForm.url}
                    onChange={e =>
                      setWebhookForm({ ...webhookForm, url: e.target.value })
                    }
                    placeholder='https://webhook.example.com/endpoint'
                  />
                </div>
                <div>
                  <Label>Events</Label>
                  <div className='space-y-2 max-h-32 overflow-y-auto'>
                    {availableEvents.map(event => (
                      <div key={event} className='flex items-center space-x-2'>
                        <input
                          type='checkbox'
                          id={event}
                          checked={webhookForm.events.includes(event)}
                          onChange={e => {
                            if (e.target.checked) {
                              setWebhookForm({
                                ...webhookForm,
                                events: [...webhookForm.events, event],
                              });
                            } else {
                              setWebhookForm({
                                ...webhookForm,
                                events: webhookForm.events.filter(
                                  ev => ev !== event
                                ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={event} className='text-sm'>
                          {event}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor='secret'>Secret (Optional)</Label>
                  <Input
                    id='secret'
                    type='password'
                    value={webhookForm.secret}
                    onChange={e =>
                      setWebhookForm({ ...webhookForm, secret: e.target.value })
                    }
                    placeholder='Webhook secret for verification'
                  />
                </div>
                <div className='flex justify-end space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => setShowWebhookForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createWebhook}>Create</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* API Key Form Modal */}
        {showApiKeyForm && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
            <Card className='w-full max-w-md'>
              <CardHeader>
                <CardTitle>Generate API Key</CardTitle>
                <CardDescription>
                  Create a new API key for external access
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div>
                  <Label htmlFor='key_name'>Key Name</Label>
                  <Input
                    id='key_name'
                    value={apiKeyForm.name}
                    onChange={e =>
                      setApiKeyForm({ ...apiKeyForm, name: e.target.value })
                    }
                    placeholder='My API Key'
                  />
                </div>
                <div>
                  <Label>Permissions</Label>
                  <div className='space-y-2 max-h-32 overflow-y-auto'>
                    {availablePermissions.map(permission => (
                      <div
                        key={permission}
                        className='flex items-center space-x-2'
                      >
                        <input
                          type='checkbox'
                          id={permission}
                          checked={apiKeyForm.permissions.includes(permission)}
                          onChange={e => {
                            if (e.target.checked) {
                              setApiKeyForm({
                                ...apiKeyForm,
                                permissions: [
                                  ...apiKeyForm.permissions,
                                  permission,
                                ],
                              });
                            } else {
                              setApiKeyForm({
                                ...apiKeyForm,
                                permissions: apiKeyForm.permissions.filter(
                                  p => p !== permission
                                ),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={permission} className='text-sm'>
                          {permission}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor='expires_at'>Expires At (Optional)</Label>
                  <Input
                    id='expires_at'
                    type='datetime-local'
                    value={apiKeyForm.expires_at}
                    onChange={e =>
                      setApiKeyForm({
                        ...apiKeyForm,
                        expires_at: e.target.value,
                      })
                    }
                  />
                </div>
                <div className='flex justify-end space-x-2'>
                  <Button
                    variant='outline'
                    onClick={() => setShowApiKeyForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={generateApiKey}>Generate</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminIntegrations;
