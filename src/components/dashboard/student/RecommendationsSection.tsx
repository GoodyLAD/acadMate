import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';

interface Certificate {
  category: 'academic' | 'co_curricular';
  status: 'pending' | 'approved' | 'rejected';
}

interface RecommendationsSectionProps {
  certificates: Certificate[];
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: 'academic' | 'co_curricular';
  type:
    | 'course'
    | 'competition'
    | 'certification'
    | 'event'
    | 'club'
    | 'volunteering';
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  // UI fields
  timeRange?: string;
  difficulty?: 'Beginner' | 'Advanced';
  mentorName?: string;
  mentorImage?: string | null;
  isNow?: boolean;
}

const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  certificates,
}) => {
  // Generate recommendations based on user's certificates
  const generateRecommendations = (): Recommendation[] => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const approvedCertificates = certificates.filter(
      cert => cert.status === 'approved'
    );

    const recommendations: Recommendation[] = [];

    // Build a few sample recommendations (fields include time, difficulty, mentor)
    recommendations.push({
      id: '1',
      title: 'Technical English for Beginners',
      description:
        'Improve your technical vocabulary and communication skills.',
      category: 'academic',
      type: 'course',
      priority: 'high',
      actionLabel: 'Register',
    });

    recommendations.push({
      id: '2',
      title: 'English punctuation made easy',
      description: 'Punctuation basics with hands-on exercises.',
      category: 'academic',
      type: 'course',
      priority: 'high',
      actionLabel: 'Join',
    });

    recommendations.push({
      id: '3',
      title: 'Technical Spanish for Beginners',
      description: 'Learn essential Spanish for technical contexts.',
      category: 'academic',
      type: 'course',
      priority: 'medium',
      actionLabel: 'Enroll',
    });

    // Additional generic recommendations
    recommendations.push({
      id: '4',
      title: 'Leadership Development Program',
      description: 'Develop leadership skills.',
      category: 'co_curricular',
      type: 'event',
      priority: 'medium',
      actionLabel: 'Apply',
    });
    recommendations.push({
      id: '5',
      title: 'Inter-University Competition',
      description: 'Compete with peers across universities.',
      category: 'co_curricular',
      type: 'competition',
      priority: 'low',
      actionLabel: 'Participate',
    });

    // Enrich with UI fields and return top 6
    const mentors = [
      'Kristin Watson',
      'Cody Fisher',
      'Jacob Jones',
      'Alex Johnson',
      'Taylor Smith',
    ];
    const enriched = recommendations.slice(0, 6).map((rec, i) => ({
      ...rec,
      timeRange:
        rec.timeRange ||
        (i === 1
          ? '13:00 — 14:00'
          : i === 0
            ? '10:30 — 12:00'
            : '16:00 — 17:00'),
      difficulty: rec.difficulty || (i === 1 ? 'Advanced' : 'Beginner'),
      mentorName: rec.mentorName || mentors[i % mentors.length],
      mentorImage: rec.mentorImage || null,
      isNow: i === 1,
    }));

    return enriched;
  };

  const recommendations = generateRecommendations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center space-x-2 text-xl font-bold'>
          <Lightbulb className='h-5 w-5' />
          <span>Recommendations for You</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {recommendations.map((rec, idx) => {
            const isFeatured = idx === 1; // center card
            const cardClass = isFeatured
              ? 'rounded-3xl p-6 min-h-[220px] shadow-xl text-white'
              : 'rounded-2xl p-6 min-h-[220px] shadow-sm bg-white';

            const bgClass = isFeatured ? 'bg-[#7C3AED]' : 'bg-white';

            const mentor = rec.mentorName || 'Mentor';
            const mentorInitial = mentor
              .split(' ')
              .map((n: any) => n[0])
              .slice(0, 2)
              .join('');
            const timeRange = rec.timeRange || '10:30 — 12:00';
            const difficulty = rec.difficulty || 'Beginner';

            return (
              <div
                key={rec.id}
                className={`relative overflow-hidden ${cardClass} ${isFeatured ? bgClass : ''} flex flex-col justify-between`}
              >
                {/* Top row: time + Now badge + difficulty tag */}
                <div className='flex items-center justify-between'>
                  <div
                    className={`${isFeatured ? 'text-white/90 text-sm' : 'text-gray-500 text-xs'}`}
                  >
                    {timeRange}
                  </div>
                  {rec.isNow && (
                    <div
                      className={`inline-flex items-center gap-2 ${isFeatured ? 'bg-amber-400 text-amber-900' : 'bg-amber-100 text-amber-800'} px-2 py-0.5 rounded-full text-xs font-medium`}
                    >
                      Now
                    </div>
                  )}
                </div>

                {/* Title and attractive difficulty tag below time */}
                <div className='mt-3'>
                  <h3
                    className={`${isFeatured ? 'text-2xl font-semibold' : 'text-lg font-semibold text-gray-900'}`}
                  >
                    {rec.title}
                  </h3>
                  <div className='mt-3 flex items-center gap-3'>
                    <span
                      className={`${isFeatured ? 'bg-white/20 text-white' : 'bg-gradient-to-r from-blue-50 to-white text-blue-700 border border-blue-100'} inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm`}
                    >
                      {difficulty}
                    </span>
                    <span
                      className={`${isFeatured ? 'bg-white/12 text-white/90' : 'bg-gray-50 text-gray-500'} px-2 py-0.5 rounded-full text-xs`}
                    >
                      {rec.type}
                    </span>
                  </div>
                </div>

                {/* Fill spacer to reduce empty space - ensures footer sticks to bottom */}
                <div className='flex-1' />

                {/* Footer: mentor + action aligned horizontally */}
                <div className='flex items-center justify-between pt-4'>
                  <div className='flex items-center gap-3'>
                    <div
                      className={`relative flex h-10 w-10 items-center justify-center rounded-full ${isFeatured ? 'bg-white' : 'bg-gray-100'}`}
                    >
                      {rec.mentorImage ? (
                        <img
                          src={rec.mentorImage}
                          alt={mentor}
                          className='h-10 w-10 rounded-full object-cover'
                        />
                      ) : (
                        <span
                          className={`${isFeatured ? 'text-[#7C3AED]' : 'text-gray-700'} font-medium`}
                        >
                          {mentorInitial}
                        </span>
                      )}
                    </div>
                    <div
                      className={`${isFeatured ? 'text-white' : 'text-gray-900'}`}
                    >
                      <div className='text-sm font-medium'>{mentor}</div>
                      <div
                        className={`${isFeatured ? 'text-white/80 text-xs' : 'text-gray-500 text-xs'}`}
                      >
                        Mentor
                      </div>
                    </div>
                  </div>

                  <div>
                    <Button
                      size='sm'
                      className={`${isFeatured ? 'bg-white text-[#7C3AED] hover:bg-white/90' : 'bg-white border'} py-1 px-3`}
                    >
                      {rec.actionLabel}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {recommendations.length === 0 && (
          <div className='text-center py-8'>
            <Lightbulb className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
            <p className='text-muted-foreground'>
              Upload some certificates to get personalized recommendations!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecommendationsSection;
