import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import {
  externalCourseService,
  ExternalCourse,
} from '@/services/externalCourseService';
import {
  BookOpen,
  Star,
  Clock,
  ExternalLink,
  Search,
  DollarSign,
  Award,
  Globe,
  Play,
} from 'lucide-react';

const ExternalCourseRecommendations: React.FC = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [courses, setCourses] = useState<ExternalCourse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    platforms: [] as string[],
    difficulty: [] as string[],
    price_range: 'all' as 'free' | 'paid' | 'all',
    rating_min: 0,
    duration_min: 0,
    duration_max: 1000,
  });
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const platforms = [
    {
      value: 'coursera',
      label: 'Coursera',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      value: 'linkedin',
      label: 'LinkedIn Learning',
      color: 'bg-blue-100 text-blue-800',
    },
    { value: 'udemy', label: 'Udemy', color: 'bg-purple-100 text-purple-800' },
    { value: 'edx', label: 'edX', color: 'bg-green-100 text-green-800' },
    {
      value: 'pluralsight',
      label: 'Pluralsight',
      color: 'bg-orange-100 text-orange-800',
    },
    {
      value: 'khan_academy',
      label: 'Khan Academy',
      color: 'bg-yellow-100 text-yellow-800',
    },
    {
      value: 'freecodecamp',
      label: 'freeCodeCamp',
      color: 'bg-green-100 text-green-800',
    },
    { value: 'youtube', label: 'YouTube', color: 'bg-red-100 text-red-800' },
  ];

  useEffect(() => {
    if (profile && profile.role === 'student') {
      fetchRecommendations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const fetchRecommendations = async () => {
    if (!profile) return;

    try {
      setLoading(true);
      const studentProfile = {
        interests: profile.interests || [],
        skills: profile.skills || [],
        career_goals: profile.career_goals || [],
        experience_level: profile.experience_level || 'beginner',
      };

      const recs = await externalCourseService.getExternalRecommendations(
        studentProfile,
        12
      );
      setCourses(recs);
    } catch (error) {
      console.error('Error fetching external recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load external course recommendations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const results = await externalCourseService.searchCourses(
        searchQuery,
        filters,
        20
      );
      setCourses(results);
    } catch (error) {
      console.error('Error searching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to search courses',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async () => {
    // Apply filters immediately when they change
    await handleSearch();
  };

  const getPlatformColor = (platform: string) => {
    const platformInfo = platforms.find(p => p.value === platform);
    return platformInfo?.color || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${price}`;
  };

  const handleImageError = (courseId: string) => {
    setImageErrors(prev => new Set(prev).add(courseId));
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${Math.round(hours)} hours`;
    const days = Math.round(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Globe className='h-5 w-5' />
            External Course Recommendations
          </CardTitle>
          <CardDescription>
            Discover courses from top learning platforms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            <p className='mt-2 text-gray-600'>
              Searching external platforms...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Globe className='h-5 w-5' />
          External Course Recommendations
        </CardTitle>
        <CardDescription>
          Discover courses from Coursera, LinkedIn Learning, Udemy, edX, and
          more
        </CardDescription>
      </CardHeader>

      <CardContent className='space-y-6'>
        {/* Search and Filters */}
        <div className='space-y-4'>
          <div className='flex gap-2'>
            <div className='flex-1'>
              <Input
                placeholder='Search for courses, skills, or topics...'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className='h-4 w-4 mr-2' />
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div>
              <Label>Platforms</Label>
              <Select
                value={filters.platforms[0] || 'all'}
                onValueChange={value => {
                  setFilters(prev => ({
                    ...prev,
                    platforms: value === 'all' ? [] : [value],
                  }));
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All platforms' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All platforms</SelectItem>
                  {platforms.map(platform => (
                    <SelectItem key={platform.value} value={platform.value}>
                      {platform.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Difficulty</Label>
              <Select
                value={filters.difficulty[0] || 'all'}
                onValueChange={value => {
                  setFilters(prev => ({
                    ...prev,
                    difficulty: value === 'all' ? [] : [value],
                  }));
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder='All levels' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All levels</SelectItem>
                  <SelectItem value='beginner'>Beginner</SelectItem>
                  <SelectItem value='intermediate'>Intermediate</SelectItem>
                  <SelectItem value='advanced'>Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Price</Label>
              <Select
                value={filters.price_range}
                onValueChange={value => {
                  setFilters(prev => ({
                    ...prev,
                    price_range: value as any,
                  }));
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All prices</SelectItem>
                  <SelectItem value='free'>Free only</SelectItem>
                  <SelectItem value='paid'>Paid only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Min Rating</Label>
              <Select
                value={filters.rating_min.toString()}
                onValueChange={value => {
                  setFilters(prev => ({
                    ...prev,
                    rating_min: parseInt(value),
                  }));
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Any rating</SelectItem>
                  <SelectItem value='3'>3+ stars</SelectItem>
                  <SelectItem value='4'>4+ stars</SelectItem>
                  <SelectItem value='4.5'>4.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {courses.length === 0 ? (
          <div className='text-center py-8'>
            <BookOpen className='h-16 w-16 mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No Courses Found
            </h3>
            <p className='text-gray-600 mb-4'>
              Try adjusting your search terms or filters to find more courses.
            </p>
            <Button onClick={fetchRecommendations} variant='outline'>
              Show Recommendations
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {courses.map(course => (
              <Card
                key={course.id}
                className='hover:shadow-lg transition-all duration-300 group'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg group-hover:text-primary transition-colors line-clamp-2'>
                        {course.title}
                      </CardTitle>
                      <CardDescription className='text-sm'>
                        {course.instructor} • {course.provider}
                      </CardDescription>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Star className='h-4 w-4 text-yellow-500' />
                      <span className='text-sm font-medium'>
                        {course.rating}
                      </span>
                    </div>
                  </div>

                  {/* Platform and Difficulty Badges */}
                  <div className='flex gap-2 mb-2'>
                    <Badge className={getPlatformColor(course.platform)}>
                      {course.provider}
                    </Badge>
                    <Badge
                      className={getDifficultyColor(course.difficulty_level)}
                    >
                      {course.difficulty_level}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Course Image */}
                  <div className='aspect-video bg-gray-100 rounded-lg overflow-hidden relative group/image'>
                    {course.thumbnail_url && !imageErrors.has(course.id) ? (
                      <>
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out'
                          onError={() => handleImageError(course.id)}
                        />
                        {/* Overlay on hover */}
                        <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center'>
                          <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                            <div className='bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-lg'>
                              <Play className='h-6 w-6 text-gray-800' />
                            </div>
                          </div>
                        </div>
                        {/* Platform badge overlay */}
                        <div className='absolute top-2 left-2'>
                          <Badge
                            className={`${getPlatformColor(course.platform)} shadow-lg backdrop-blur-sm`}
                          >
                            {course.provider}
                          </Badge>
                        </div>
                        {/* Price badge overlay */}
                        <div className='absolute top-2 right-2'>
                          <Badge
                            className={`${course.is_free ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'} shadow-lg backdrop-blur-sm`}
                          >
                            {course.is_free ? 'FREE' : `$${course.price}`}
                          </Badge>
                        </div>
                        {/* Certificate badge */}
                        {course.certificate_available && (
                          <div className='absolute bottom-2 right-2'>
                            <div className='bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm flex items-center gap-1'>
                              <Award className='h-3 w-3' />
                              Certificate
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative'>
                        <div className='text-center'>
                          <div className='bg-white/80 backdrop-blur-sm rounded-full p-4 mb-3 shadow-lg'>
                            <BookOpen className='h-12 w-12 text-gray-400 mx-auto' />
                          </div>
                          <p className='text-sm text-gray-600 font-medium'>
                            {course.provider}
                          </p>
                          <p className='text-xs text-gray-500 mt-1'>
                            {course.title}
                          </p>
                        </div>
                        {/* Decorative elements */}
                        <div className='absolute top-4 right-4 w-8 h-8 bg-blue-200/30 rounded-full'></div>
                        <div className='absolute bottom-4 left-4 w-6 h-6 bg-purple-200/30 rounded-full'></div>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className='text-sm text-gray-600 line-clamp-3'>
                    {course.description}
                  </p>

                  {/* Course Details */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Clock className='h-4 w-4' />
                      <span>{formatDuration(course.duration_hours)}</span>
                    </div>

                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <DollarSign className='h-4 w-4' />
                      <span
                        className={
                          course.is_free ? 'text-green-600 font-medium' : ''
                        }
                      >
                        {formatPrice(course.price)}
                      </span>
                    </div>

                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Globe className='h-4 w-4' />
                      <span>{course.language}</span>
                    </div>

                    {course.certificate_available && (
                      <div className='flex items-center gap-2 text-sm text-green-600'>
                        <Award className='h-4 w-4' />
                        <span>Certificate Available</span>
                      </div>
                    )}
                  </div>

                  {/* Skills */}
                  {course.skills.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium text-gray-900'>
                        Skills:
                      </h4>
                      <div className='flex flex-wrap gap-1'>
                        {course.skills.slice(0, 3).map((skill, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='text-xs'
                          >
                            {skill}
                          </Badge>
                        ))}
                        {course.skills.length > 3 && (
                          <Badge variant='outline' className='text-xs'>
                            +{course.skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className='flex gap-2 pt-2'>
                    <Button
                      className='flex-1'
                      size='sm'
                      onClick={() => window.open(course.url, '_blank')}
                    >
                      <ExternalLink className='h-4 w-4 mr-1' />
                      View Course
                    </Button>
                    {course.platform === 'youtube' && (
                      <Button variant='outline' size='sm'>
                        <Play className='h-4 w-4' />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {courses.length > 0 && (
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Showing {courses.length} courses from external platforms
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExternalCourseRecommendations;
