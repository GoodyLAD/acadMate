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
import { Progress } from '@/components/ui/progress';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import {
  recommendationEngine,
  CourseRecommendation,
} from '@/services/recommendationService';
import {
  BookOpen,
  Star,
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

const CourseRecommendations: React.FC = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<
    CourseRecommendation[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');

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
      const recs = await recommendationEngine.generateRecommendations(
        profile.id,
        12
      );
      setRecommendations(recs);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course recommendations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent Match';
    if (score >= 0.6) return 'Good Match';
    if (score >= 0.4) return 'Fair Match';
    return 'Low Match';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Web Development': 'bg-blue-100 text-blue-800',
      'Data Science': 'bg-green-100 text-green-800',
      'Mobile Development': 'bg-purple-100 text-purple-800',
      'Cloud Computing': 'bg-orange-100 text-orange-800',
      Cybersecurity: 'bg-red-100 text-red-800',
      Blockchain: 'bg-yellow-100 text-yellow-800',
      'Game Development': 'bg-pink-100 text-pink-800',
      Database: 'bg-indigo-100 text-indigo-800',
      Algorithms: 'bg-teal-100 text-teal-800',
      'UI/UX': 'bg-rose-100 text-rose-800',
      Programming: 'bg-gray-100 text-gray-800',
      'Computer Science': 'bg-slate-100 text-slate-800',
    };
    return colors[category] || colors['Programming'];
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

  const filteredRecommendations = recommendations.filter(rec => {
    switch (selectedFilter) {
      case 'high':
        return rec.match_score >= 0.7;
      case 'medium':
        return rec.match_score >= 0.4 && rec.match_score < 0.7;
      case 'low':
        return rec.match_score < 0.4;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Recommended Courses
          </CardTitle>
          <CardDescription>
            AI-powered course recommendations based on your profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='text-center py-8'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
            <p className='mt-2 text-gray-600'>Analyzing your profile...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='flex items-center gap-2'>
              <TrendingUp className='h-5 w-5' />
              Recommended Courses
            </CardTitle>
            <CardDescription>
              AI-powered course recommendations based on your profile,
              interests, and certifications
            </CardDescription>
          </div>
          <Button onClick={fetchRecommendations} variant='outline' size='sm'>
            Refresh
          </Button>
        </div>

        {/* Filter Buttons */}
        <div className='flex gap-2 mt-4'>
          {[
            { key: 'all', label: 'All', count: recommendations.length },
            {
              key: 'high',
              label: 'High Match',
              count: recommendations.filter(r => r.match_score >= 0.7).length,
            },
            {
              key: 'medium',
              label: 'Medium Match',
              count: recommendations.filter(
                r => r.match_score >= 0.4 && r.match_score < 0.7
              ).length,
            },
            {
              key: 'low',
              label: 'Low Match',
              count: recommendations.filter(r => r.match_score < 0.4).length,
            },
          ].map(filter => (
            <Button
              key={filter.key}
              variant={selectedFilter === filter.key ? 'default' : 'outline'}
              size='sm'
              onClick={() => setSelectedFilter(filter.key as any)}
            >
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {filteredRecommendations.length === 0 ? (
          <div className='text-center py-8'>
            <BookOpen className='h-16 w-16 mx-auto text-gray-400 mb-4' />
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              No Recommendations Found
            </h3>
            <p className='text-gray-600 mb-4'>
              We couldn't find any courses that match your current profile.
            </p>
            <Button onClick={fetchRecommendations} variant='outline'>
              Try Again
            </Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredRecommendations.map(rec => (
              <Card
                key={rec.course_id}
                className='hover:shadow-lg transition-all duration-300 group'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between mb-2'>
                    <div className='flex-1'>
                      <CardTitle className='text-lg group-hover:text-primary transition-colors line-clamp-2'>
                        {rec.course_name}
                      </CardTitle>
                      <CardDescription className='text-sm'>
                        {rec.course_code} • {rec.instructor}
                      </CardDescription>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Star className='h-4 w-4 text-yellow-500' />
                      <span
                        className={`text-sm font-medium ${getMatchScoreColor(rec.match_score)}`}
                      >
                        {Math.round(rec.match_score * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Category and Match Score */}
                  <div className='flex items-center justify-between mb-3'>
                    {rec.category && (
                      <Badge className={getCategoryColor(rec.category)}>
                        {rec.category}
                      </Badge>
                    )}
                    <div className='text-right'>
                      <div className='text-xs text-gray-600'>
                        {getMatchScoreLabel(rec.match_score)}
                      </div>
                      <Progress
                        value={rec.match_score * 100}
                        className='h-1.5 w-16'
                      />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className='space-y-4'>
                  {/* Description */}
                  <p className='text-sm text-gray-600 line-clamp-2'>
                    {rec.description}
                  </p>

                  {/* Course Details */}
                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Clock className='h-4 w-4' />
                      <span>{rec.estimated_duration} hours</span>
                    </div>

                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                      <Target className='h-4 w-4' />
                      <Badge
                        className={getDifficultyColor(rec.difficulty_level)}
                      >
                        {rec.difficulty_level}
                      </Badge>
                    </div>
                  </div>

                  {/* Skills Gained */}
                  {rec.skills_gained.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium text-gray-900'>
                        Skills You'll Gain:
                      </h4>
                      <div className='flex flex-wrap gap-1'>
                        {rec.skills_gained.slice(0, 3).map((skill, index) => (
                          <Badge
                            key={index}
                            variant='secondary'
                            className='text-xs'
                          >
                            {skill}
                          </Badge>
                        ))}
                        {rec.skills_gained.length > 3 && (
                          <Badge variant='outline' className='text-xs'>
                            +{rec.skills_gained.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Why Recommended */}
                  {rec.reasons.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium text-gray-900'>
                        Why Recommended:
                      </h4>
                      <ul className='space-y-1'>
                        {rec.reasons.slice(0, 2).map((reason, index) => (
                          <li
                            key={index}
                            className='text-xs text-gray-600 flex items-start gap-1'
                          >
                            <CheckCircle className='h-3 w-3 text-green-500 mt-0.5 flex-shrink-0' />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Career Relevance */}
                  {rec.career_relevance.length > 0 && (
                    <div className='space-y-2'>
                      <h4 className='text-sm font-medium text-gray-900'>
                        Career Paths:
                      </h4>
                      <div className='flex flex-wrap gap-1'>
                        {rec.career_relevance
                          .slice(0, 2)
                          .map((career, index) => (
                            <Badge
                              key={index}
                              variant='outline'
                              className='text-xs'
                            >
                              {career}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className='flex gap-2 pt-2'>
                    <Button className='flex-1' size='sm'>
                      <BookOpen className='h-4 w-4 mr-1' />
                      Enroll
                    </Button>
                    <Button variant='outline' size='sm'>
                      <ExternalLink className='h-4 w-4' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary */}
        {filteredRecommendations.length > 0 && (
          <div className='mt-6 text-center'>
            <p className='text-sm text-gray-600'>
              Showing {filteredRecommendations.length} of{' '}
              {recommendations.length} recommended courses
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseRecommendations;
