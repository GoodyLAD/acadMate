import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  Target,
  Plus,
  Calendar,
  Flag,
  CheckCircle,
  Pause,
  X,
} from 'lucide-react';
import { StudentGoal, useStudent } from '@/hooks/useStudent';

interface StudentGoalsCardProps {
  goals: StudentGoal[];
  loading?: boolean;
}

const StudentGoalsCard: React.FC<StudentGoalsCardProps> = ({
  goals,
  loading,
}) => {
  const { createGoal, updateGoal } = useStudent();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goal_type: 'certificate',
    target_value: 1,
    priority: 'medium' as StudentGoal['priority'],
    target_date: '',
  });

  const activeGoals = goals.filter(goal => goal.status === 'active');
  const completedGoals = goals.filter(goal => goal.status === 'completed');
  const pausedGoals = goals.filter(goal => goal.status === 'paused');

  const getPriorityColor = (priority: StudentGoal['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'high':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'medium':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'low':
        return 'bg-green-50 text-green-600 border-green-100';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  const getStatusIcon = (status: StudentGoal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className='h-4 w-4 text-green-500' />;
      case 'paused':
        return <Pause className='h-4 w-4 text-amber-500' />;
      case 'cancelled':
        return <X className='h-4 w-4 text-red-500' />;
      default:
        return <Target className='h-4 w-4 text-sky-500' />;
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createGoal({
        ...formData,
        target_value: formData.target_value,
        current_value: 0,
        status: 'active',
      });

      setFormData({
        title: '',
        description: '',
        goal_type: 'certificate',
        target_value: 1,
        priority: 'medium',
        target_date: '',
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleUpdateGoal = async (
    goalId: string,
    updates: Partial<StudentGoal>
  ) => {
    try {
      await updateGoal(goalId, updates);
      setIsEditing(null);
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const getProgressPercentage = (goal: StudentGoal) => {
    if (!goal.target_value) return 0;
    return Math.min(
      100,
      Math.round((goal.current_value / goal.target_value) * 100)
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5' />
            Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='animate-pulse space-y-4'>
            <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            <div className='space-y-2'>
              {[1, 2, 3].map(i => (
                <div key={i} className='h-16 bg-gray-200 rounded'></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5' />
            Goals
          </CardTitle>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size='sm'>
                <Plus className='h-4 w-4 mr-2' />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGoal} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='title'>Goal Title</Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={e =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder='e.g., Complete 5 certificates'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='description'>Description (Optional)</Label>
                  <Textarea
                    id='description'
                    value={formData.description}
                    onChange={e =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder='Describe your goal...'
                    rows={3}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='goal_type'>Goal Type</Label>
                    <Select
                      value={formData.goal_type}
                      onValueChange={value =>
                        setFormData({ ...formData, goal_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='certificate'>Certificate</SelectItem>
                        <SelectItem value='course'>Course</SelectItem>
                        <SelectItem value='skill'>Skill</SelectItem>
                        <SelectItem value='personal'>Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='target_value'>Target Value</Label>
                    <Input
                      id='target_value'
                      type='number'
                      min='1'
                      value={formData.target_value}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          target_value: parseInt(e.target.value) || 1,
                        })
                      }
                      required
                    />
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='priority'>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: StudentGoal['priority']) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='low'>Low</SelectItem>
                        <SelectItem value='medium'>Medium</SelectItem>
                        <SelectItem value='high'>High</SelectItem>
                        <SelectItem value='urgent'>Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='target_date'>Target Date (Optional)</Label>
                    <Input
                      id='target_date'
                      type='date'
                      value={formData.target_date}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          target_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className='flex justify-end gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Create Goal</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {goals.length === 0 ? (
          <div className='text-center py-8 text-muted-foreground'>
            <Target className='h-12 w-12 mx-auto mb-4 opacity-50' />
            <p>No goals set yet</p>
            <p className='text-sm'>
              Create your first goal to start tracking your progress!
            </p>
          </div>
        ) : (
          <>
            {/* Active Goals */}
            {activeGoals.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Flag className='h-4 w-4 text-sky-500' />
                  <span className='font-medium text-sm'>
                    Active Goals ({activeGoals.length})
                  </span>
                </div>
                <div className='space-y-2'>
                  {activeGoals.map(goal => (
                    <div
                      key={goal.id}
                      className='p-3 rounded-lg border bg-muted/30'
                    >
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center gap-2'>
                          {getStatusIcon(goal.status)}
                          <span className='font-medium text-sm'>
                            {goal.title}
                          </span>
                          <Badge
                            variant='outline'
                            className={`text-xs ${getPriorityColor(goal.priority)}`}
                          >
                            {goal.priority}
                          </Badge>
                        </div>
                        <div className='flex items-center gap-1'>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() =>
                              handleUpdateGoal(goal.id, { status: 'completed' })
                            }
                          >
                            <CheckCircle className='h-4 w-4' />
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={() =>
                              handleUpdateGoal(goal.id, { status: 'paused' })
                            }
                          >
                            <Pause className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex items-center justify-between text-xs text-muted-foreground'>
                          <span>
                            {goal.current_value} / {goal.target_value}
                          </span>
                          <span>{getProgressPercentage(goal)}%</span>
                        </div>
                        <Progress
                          value={getProgressPercentage(goal)}
                          className='h-2'
                        />
                      </div>

                      {goal.description && (
                        <p className='text-xs text-muted-foreground mt-2'>
                          {goal.description}
                        </p>
                      )}

                      {goal.target_date && (
                        <div className='flex items-center gap-1 mt-2 text-xs text-muted-foreground'>
                          <Calendar className='h-3 w-3' />
                          <span>
                            Target:{' '}
                            {new Date(goal.target_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Goals */}
            {completedGoals.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <CheckCircle className='h-4 w-4 text-green-500' />
                  <span className='font-medium text-sm'>
                    Completed Goals ({completedGoals.length})
                  </span>
                </div>
                <div className='space-y-2'>
                  {completedGoals.slice(0, 3).map(goal => (
                    <div
                      key={goal.id}
                      className='p-3 rounded-lg border bg-green-50'
                    >
                      <div className='flex items-center gap-2'>
                        {getStatusIcon(goal.status)}
                        <span className='font-medium text-sm'>
                          {goal.title}
                        </span>
                        <Badge
                          variant='outline'
                          className='text-xs bg-green-50 text-green-600'
                        >
                          Completed
                        </Badge>
                      </div>
                      {goal.completed_at && (
                        <p className='text-xs text-muted-foreground mt-1'>
                          Completed on{' '}
                          {new Date(goal.completed_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Paused Goals */}
            {pausedGoals.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Pause className='h-4 w-4 text-amber-500' />
                  <span className='font-medium text-sm'>
                    Paused Goals ({pausedGoals.length})
                  </span>
                </div>
                <div className='space-y-2'>
                  {pausedGoals.slice(0, 2).map(goal => (
                    <div
                      key={goal.id}
                      className='p-3 rounded-lg border bg-yellow-50'
                    >
                      <div className='flex items-center gap-2'>
                        {getStatusIcon(goal.status)}
                        <span className='font-medium text-sm'>
                          {goal.title}
                        </span>
                        <Badge
                          variant='outline'
                          className='text-xs bg-amber-50 text-amber-600'
                        >
                          Paused
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentGoalsCard;
