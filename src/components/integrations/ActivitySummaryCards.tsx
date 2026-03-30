import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Target, Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityStats {
  totalSolved: number;
  weekSolved: number;
  currentStreak: number;
  contestRating: number;
}

interface ActivitySummaryCardsProps {
  stats: ActivityStats;
}

const ActivitySummaryCards: React.FC<ActivitySummaryCardsProps> = ({
  stats,
}) => {
  const cards = [
    {
      title: 'Total Problems',
      value: stats.totalSolved,
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+12 this month',
    },
    {
      title: 'This Week',
      value: stats.weekSolved,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '+3 from last week',
    },
    {
      title: 'Current Streak',
      value: stats.currentStreak,
      icon: Flame,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: 'days active',
      suffix: '🔥',
    },
    {
      title: 'Contest Rating',
      value: stats.contestRating,
      icon: Trophy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: '+45 this month',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: [0.21, 1.11, 0.81, 0.99],
            }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 },
            }}
          >
            <Card className='group relative overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-md transition-all duration-300 hover:shadow-xl'>
              <div className='absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

              <CardHeader className='relative flex flex-row items-center justify-between space-y-0 pb-2'>
                <CardTitle className='text-sm font-medium text-muted-foreground'>
                  {card.title}
                </CardTitle>
                <motion.div
                  className={`rounded-full p-2 ${card.bgColor}`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </motion.div>
              </CardHeader>

              <CardContent className='relative'>
                <div className='flex items-baseline gap-2'>
                  <motion.div
                    className='text-3xl font-bold tracking-tight'
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: index * 0.1 + 0.3,
                      type: 'spring',
                      stiffness: 200,
                    }}
                  >
                    {card.value.toLocaleString()}
                  </motion.div>
                  {card.suffix && (
                    <span className='text-lg'>{card.suffix}</span>
                  )}
                </div>
                <p className='text-xs text-muted-foreground mt-1'>
                  {card.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ActivitySummaryCards;
