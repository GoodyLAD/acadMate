import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Play,
  Code,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Trash2,
  Plus,
  Zap,
  Database,
  Server,
  Eye,
  Download,
  Upload,
  BookOpen,
  Users,
  Award,
  GraduationCap,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

const AdminApiTesting = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('test');
  const [isLoading, setIsLoading] = useState(false);
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
  const [requestHistory, setRequestHistory] = useState<
    Array<ApiRequest & { response: ApiResponse; timestamp: Date }>
  >([]);
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(
    null
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const exampleApis = [
    {
      name: 'LMS Students - Get All',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/users',
      description: 'Get all students from LMS (simulated with users)',
      icon: Users,
      category: 'Students',
    },
    {
      name: 'LMS Student - Get by ID',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/users/1',
      description: 'Get specific student details by ID',
      icon: Users,
      category: 'Students',
    },
    {
      name: 'LMS Courses - Get All',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/posts',
      description: 'Get all courses from LMS (simulated with posts)',
      icon: BookOpen,
      category: 'Courses',
    },
    {
      name: 'LMS Course - Get by ID',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/posts/1',
      description: 'Get specific course details by ID',
      icon: BookOpen,
      category: 'Courses',
    },
    {
      name: 'LMS Enrollments - Create',
      method: 'POST' as const,
      url: 'https://jsonplaceholder.typicode.com/posts',
      description: 'Enroll student in course',
      icon: GraduationCap,
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
      description: 'Update student grade for course',
      icon: Award,
      category: 'Grades',
      body: JSON.stringify(
        {
          student_id: '12345',
          course_id: 'CS101',
          assignment_id: 'HW1',
          grade: 85,
          feedback: 'Good work, needs improvement in problem-solving',
          graded_date: new Date().toISOString(),
        },
        null,
        2
      ),
    },
    {
      name: 'LMS Achievements - Get All',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/albums',
      description: 'Get all student achievements',
      icon: Award,
      category: 'Achievements',
    },
    {
      name: 'LMS Attendance - Create',
      method: 'POST' as const,
      url: 'https://jsonplaceholder.typicode.com/posts',
      description: 'Mark student attendance',
      icon: Clock,
      category: 'Attendance',
      body: JSON.stringify(
        {
          student_id: '12345',
          course_id: 'CS101',
          class_date: new Date().toISOString().split('T')[0],
          status: 'present',
          timestamp: new Date().toISOString(),
        },
        null,
        2
      ),
    },
    {
      name: 'LMS Assignments - Get All',
      method: 'GET' as const,
      url: 'https://jsonplaceholder.typicode.com/todos',
      description: 'Get all course assignments',
      icon: BookOpen,
      category: 'Assignments',
    },
    {
      name: 'LMS Submission - Create',
      method: 'POST' as const,
      url: 'https://jsonplaceholder.typicode.com/posts',
      description: 'Submit assignment',
      icon: Upload,
      category: 'Submissions',
      body: JSON.stringify(
        {
          student_id: '12345',
          assignment_id: 'HW1',
          course_id: 'CS101',
          submission_text: 'Assignment solution here...',
          attachments: ['solution.pdf', 'code.zip'],
          submitted_at: new Date().toISOString(),
        },
        null,
        2
      ),
    },
  ];

  const handleMethodChange = (method: string) => {
    setCurrentRequest({
      ...currentRequest,
      method: method as ApiRequest['method'],
    });
  };

  const handleHeaderChange = (key: string, value: string) => {
    const newHeaders = { ...currentRequest.headers };
    if (value.trim() === '') {
      delete newHeaders[key];
    } else {
      newHeaders[key] = value;
    }
    setCurrentRequest({ ...currentRequest, headers: newHeaders });
  };

  const addHeader = () => {
    const newKey = `header-${Date.now()}`;
    setCurrentRequest({
      ...currentRequest,
      headers: { ...currentRequest.headers, [newKey]: '' },
    });
  };

  const removeHeader = (key: string) => {
    const newHeaders = { ...currentRequest.headers };
    delete newHeaders[key];
    setCurrentRequest({ ...currentRequest, headers: newHeaders });
  };

  const loadExample = (example: any) => {
    setCurrentRequest({
      id: '',
      name: example.name,
      method: example.method,
      url: example.url,
      headers: { 'Content-Type': 'application/json' },
      body: example.body || '',
      description: example.description,
    });
  };

  const executeRequest = async () => {
    if (!currentRequest.url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const requestOptions: RequestInit = {
        method: currentRequest.method,
        headers: currentRequest.headers,
      };

      if (
        ['POST', 'PUT', 'PATCH'].includes(currentRequest.method) &&
        currentRequest.body.trim()
      ) {
        requestOptions.body = currentRequest.body;
      }

      const res = await fetch(currentRequest.url, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseData;
      const contentType = res.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        responseData = await res.json();
      } else {
        responseData = await res.text();
      }

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const apiResponse: ApiResponse = {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data: responseData,
        time: responseTime,
        size: JSON.stringify(responseData).length,
      };

      setResponse(apiResponse);

      // Add to history
      const historyEntry = {
        ...currentRequest,
        response: apiResponse,
        timestamp: new Date(),
      };
      setRequestHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50

      toast({
        title: 'Success',
        description: `Request completed in ${responseTime}ms`,
      });
    } catch (error) {
      const errorResponse: ApiResponse = {
        status: 0,
        statusText: 'Network Error',
        headers: {},
        data: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        time: Date.now() - startTime,
        size: 0,
      };
      setResponse(errorResponse);

      toast({
        title: 'Error',
        description: 'Request failed. Check console for details.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveRequest = () => {
    if (!currentRequest.name.trim() || !currentRequest.url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a name and URL',
        variant: 'destructive',
      });
      return;
    }

    const newRequest = { ...currentRequest, id: Date.now().toString() };
    setSavedRequests(prev => [newRequest, ...prev]);

    toast({
      title: 'Success',
      description: 'Request saved successfully',
    });
  };

  const loadSavedRequest = (request: ApiRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const confirmLoadRequest = () => {
    if (selectedRequest) {
      setCurrentRequest(selectedRequest);
      setIsDialogOpen(false);
      setSelectedRequest(null);
      toast({
        title: 'Success',
        description: 'Request loaded successfully',
      });
    }
  };

  const deleteSavedRequest = (id: string) => {
    setSavedRequests(prev => prev.filter(req => req.id !== id));
    toast({
      title: 'Success',
      description: 'Request deleted',
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Text copied to clipboard',
    });
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'text-green-600';
    if (status >= 300 && status < 400) return 'text-blue-600';
    if (status >= 400 && status < 500) return 'text-orange-600';
    if (status >= 500) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusIcon = (status: number) => {
    if (status >= 200 && status < 300)
      return <CheckCircle className='w-4 h-4' />;
    if (status >= 400) return <XCircle className='w-4 h-4' />;
    return <AlertCircle className='w-4 h-4' />;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>API Testing Lab</h1>
          <p className='text-gray-600 mt-2'>
            Test and experiment with different APIs before setting up
            integrations
          </p>
        </div>
        <Badge variant='outline' className='text-sm'>
          <Code className='w-4 h-4 mr-1' />
          Developer Tool
        </Badge>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='test'>Test APIs</TabsTrigger>
          <TabsTrigger value='saved'>Saved Requests</TabsTrigger>
          <TabsTrigger value='history'>History</TabsTrigger>
        </TabsList>

        {/* Test APIs Tab */}
        <TabsContent value='test' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Request Builder */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Globe className='w-5 h-5' />
                  Request Builder
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <Label htmlFor='method'>Method</Label>
                    <Select
                      value={currentRequest.method}
                      onValueChange={handleMethodChange}
                    >
                      <SelectTrigger>
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
                  </div>
                  <div>
                    <Label htmlFor='name'>Request Name</Label>
                    <Input
                      id='name'
                      value={currentRequest.name}
                      onChange={e =>
                        setCurrentRequest({
                          ...currentRequest,
                          name: e.target.value,
                        })
                      }
                      placeholder='My API Test'
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor='url'>URL</Label>
                  <Input
                    id='url'
                    value={currentRequest.url}
                    onChange={e =>
                      setCurrentRequest({
                        ...currentRequest,
                        url: e.target.value,
                      })
                    }
                    placeholder='https://api.example.com/endpoint'
                  />
                </div>

                <div>
                  <Label htmlFor='description'>Description</Label>
                  <Input
                    id='description'
                    value={currentRequest.description}
                    onChange={e =>
                      setCurrentRequest({
                        ...currentRequest,
                        description: e.target.value,
                      })
                    }
                    placeholder='What does this API do?'
                  />
                </div>

                {/* Headers */}
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <Label>Headers</Label>
                    <Button size='sm' variant='outline' onClick={addHeader}>
                      <Plus className='w-4 h-4 mr-1' />
                      Add Header
                    </Button>
                  </div>
                  <div className='space-y-2'>
                    {Object.entries(currentRequest.headers).map(
                      ([key, value]) => (
                        <div key={key} className='flex gap-2'>
                          <Input
                            value={key}
                            onChange={e => {
                              const newHeaders = { ...currentRequest.headers };
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
                              handleHeaderChange(key, e.target.value)
                            }
                            placeholder='Header value'
                            className='flex-1'
                          />
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={() => removeHeader(key)}
                          >
                            <Trash2 className='w-4 h-4' />
                          </Button>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {['POST', 'PUT', 'PATCH'].includes(currentRequest.method) && (
                  <div>
                    <Label htmlFor='body'>Request Body</Label>
                    <Textarea
                      id='body'
                      value={currentRequest.body}
                      onChange={e =>
                        setCurrentRequest({
                          ...currentRequest,
                          body: e.target.value,
                        })
                      }
                      placeholder='Enter JSON or other data...'
                      rows={6}
                    />
                  </div>
                )}

                <div className='flex gap-2'>
                  <Button
                    onClick={executeRequest}
                    disabled={isLoading}
                    className='flex-1'
                  >
                    {isLoading ? (
                      <>
                        <Clock className='w-4 h-4 mr-2 animate-spin' />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Play className='w-4 h-4 mr-2' />
                        Send Request
                      </>
                    )}
                  </Button>
                  <Button variant='outline' onClick={saveRequest}>
                    <Database className='w-4 h-4 mr-2' />
                    Save
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Response Display */}
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Server className='w-5 h-5' />
                  Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                {response ? (
                  <div className='space-y-4'>
                    {/* Status */}
                    <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                      <div className='flex items-center gap-2'>
                        {getStatusIcon(response.status)}
                        <span
                          className={`font-semibold ${getStatusColor(response.status)}`}
                        >
                          {response.status} {response.statusText}
                        </span>
                      </div>
                      <div className='flex items-center gap-4 text-sm text-gray-600'>
                        <span className='flex items-center gap-1'>
                          <Clock className='w-4 h-4' />
                          {response.time}ms
                        </span>
                        <span className='flex items-center gap-1'>
                          <Download className='w-4 h-4' />
                          {response.size} bytes
                        </span>
                      </div>
                    </div>

                    {/* Headers */}
                    <div>
                      <h4 className='font-semibold mb-2'>Response Headers</h4>
                      <div className='bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto'>
                        <pre className='text-xs'>
                          {Object.entries(response.headers).map(
                            ([key, value]) => (
                              <div key={key} className='flex justify-between'>
                                <span className='font-mono text-blue-600'>
                                  {key}:
                                </span>
                                <span className='font-mono text-gray-700'>
                                  {value}
                                </span>
                              </div>
                            )
                          )}
                        </pre>
                      </div>
                    </div>

                    {/* Body */}
                    <div>
                      <div className='flex items-center justify-between mb-2'>
                        <h4 className='font-semibold'>Response Body</h4>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(response.data, null, 2)
                            )
                          }
                        >
                          <Copy className='w-4 h-4 mr-1' />
                          Copy
                        </Button>
                      </div>
                      <div className='bg-gray-900 text-green-400 rounded-lg p-4 max-h-96 overflow-y-auto'>
                        <pre className='text-xs'>
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='text-center py-8 text-gray-500'>
                    <Globe className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                    <p>Send a request to see the response here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Example APIs */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Zap className='w-5 h-5' />
                Example APIs
              </CardTitle>
              <p className='text-sm text-gray-600'>
                Click on any example to load it into the request builder
              </p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {exampleApis.map((api, index) => {
                  const Icon = api.icon;
                  return (
                    <Card
                      key={index}
                      className='cursor-pointer hover:shadow-md transition-shadow'
                    >
                      <CardContent
                        className='p-4'
                        onClick={() => loadExample(api)}
                      >
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <Badge variant='outline' className='text-xs'>
                              {api.method}
                            </Badge>
                            <Badge variant='secondary' className='text-xs'>
                              {api.category}
                            </Badge>
                          </div>
                          <Button size='sm' variant='ghost'>
                            <Upload className='w-4 h-4' />
                          </Button>
                        </div>
                        <div className='flex items-center gap-2 mb-2'>
                          <Icon className='w-4 h-4 text-blue-600' />
                          <h4 className='font-semibold text-sm'>{api.name}</h4>
                        </div>
                        <p className='text-xs text-gray-600 mb-2'>
                          {api.description}
                        </p>
                        <code className='text-xs text-blue-600 break-all'>
                          {api.url}
                        </code>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Saved Requests Tab */}
        <TabsContent value='saved' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Database className='w-5 h-5' />
                Saved Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {savedRequests.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <Database className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                  <p>No saved requests yet</p>
                  <p className='text-sm'>
                    Save requests from the Test APIs tab to see them here
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {savedRequests.map(request => (
                    <div
                      key={request.id}
                      className='flex items-center justify-between p-4 border rounded-lg'
                    >
                      <div className='flex-1'>
                        <div className='flex items-center gap-2 mb-1'>
                          <Badge variant='outline' className='text-xs'>
                            {request.method}
                          </Badge>
                          <span className='font-semibold'>{request.name}</span>
                        </div>
                        <p className='text-sm text-gray-600 mb-1'>
                          {request.description}
                        </p>
                        <code className='text-xs text-blue-600'>
                          {request.url}
                        </code>
                      </div>
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => loadSavedRequest(request)}
                        >
                          <Eye className='w-4 h-4 mr-1' />
                          Load
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => deleteSavedRequest(request.id)}
                        >
                          <Trash2 className='w-4 h-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value='history' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Clock className='w-5 h-5' />
                Request History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {requestHistory.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                  <Clock className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                  <p>No requests made yet</p>
                  <p className='text-sm'>
                    Make some API requests to see them here
                  </p>
                </div>
              ) : (
                <div className='space-y-3'>
                  {requestHistory.map((entry, index) => (
                    <div key={index} className='p-4 border rounded-lg'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          <Badge variant='outline' className='text-xs'>
                            {entry.method}
                          </Badge>
                          <span className='font-semibold'>
                            {entry.name || 'Unnamed Request'}
                          </span>
                          <span
                            className={`text-sm ${getStatusColor(entry.response.status)}`}
                          >
                            {entry.response.status}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 text-sm text-gray-500'>
                          <span>{entry.response.time}ms</span>
                          <span>{entry.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <code className='text-xs text-blue-600 block mb-2'>
                        {entry.url}
                      </code>
                      <div className='flex gap-2'>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => loadSavedRequest(entry)}
                        >
                          <Eye className='w-4 h-4 mr-1' />
                          Reload
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() =>
                            copyToClipboard(
                              JSON.stringify(entry.response.data, null, 2)
                            )
                          }
                        >
                          <Copy className='w-4 h-4 mr-1' />
                          Copy Response
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Load Request Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle>Load Saved Request</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <Label className='text-sm font-medium'>Request Name</Label>
                  <p className='text-sm text-gray-600'>
                    {selectedRequest.name}
                  </p>
                </div>
                <div>
                  <Label className='text-sm font-medium'>Method</Label>
                  <Badge variant='outline' className='ml-2'>
                    {selectedRequest.method}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className='text-sm font-medium'>URL</Label>
                <code className='block text-sm text-blue-600 bg-gray-100 p-2 rounded mt-1 break-all'>
                  {selectedRequest.url}
                </code>
              </div>

              {selectedRequest.description && (
                <div>
                  <Label className='text-sm font-medium'>Description</Label>
                  <p className='text-sm text-gray-600 mt-1'>
                    {selectedRequest.description}
                  </p>
                </div>
              )}

              {Object.keys(selectedRequest.headers).length > 0 && (
                <div>
                  <Label className='text-sm font-medium'>Headers</Label>
                  <div className='bg-gray-50 rounded-lg p-3 mt-1 max-h-32 overflow-y-auto'>
                    <pre className='text-xs'>
                      {Object.entries(selectedRequest.headers).map(
                        ([key, value]) => (
                          <div key={key} className='flex justify-between'>
                            <span className='font-mono text-blue-600'>
                              {key}:
                            </span>
                            <span className='font-mono text-gray-700'>
                              {value}
                            </span>
                          </div>
                        )
                      )}
                    </pre>
                  </div>
                </div>
              )}

              {selectedRequest.body && (
                <div>
                  <Label className='text-sm font-medium'>Request Body</Label>
                  <div className='bg-gray-900 text-green-400 rounded-lg p-3 mt-1 max-h-32 overflow-y-auto'>
                    <pre className='text-xs'>{selectedRequest.body}</pre>
                  </div>
                </div>
              )}

              <div className='flex justify-end gap-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={confirmLoadRequest}>Load Request</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminApiTesting;
