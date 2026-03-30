import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarClock, MapPin, User2, CheckCircle2 } from 'lucide-react';
import { useEvents, useEventRegistration } from '@/hooks/useEvents';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export default function EventDetail() {
  const { id } = useParams();
  const { getById } = useEvents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const event = useMemo(() => (id ? getById(id) : null), [id]);
  const { profile } = useProfile();
  const { toast } = useToast();

  const { myRegistration, register } = useEventRegistration(event?.id || null);
  const [form, setForm] = useState({ name: '', email: '', studentId: '' });
  const isStudent = profile?.role === 'student';

  if (!event) {
    return (
      <div className='min-h-screen bg-gray-100'>
        <main className='max-w-5xl mx-auto p-6'>
          <Card className='p-8 text-center'>
            <p className='text-lg'>Event not found.</p>
          </Card>
        </main>
      </div>
    );
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = register({
      name: form.name,
      email: form.email,
      studentId: form.studentId,
    });
    if (error) {
      toast({
        title: 'Registration failed',
        description: String(error),
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Registered',
        description: 'You have successfully registered for this event.',
      });
      setForm({ name: '', email: '', studentId: '' });
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <div className='relative'>
        <div className='h-64 w-full overflow-hidden'>
          <img
            src={event.bannerUrl || '/placeholder.svg'}
            alt={event.title}
            className='h-full w-full object-cover'
          />
        </div>
        <div className='backdrop-blur-sm bg-white/60 border-b'>
          <div className='max-w-5xl mx-auto p-6'>
            <h1 className='text-3xl font-bold tracking-tight'>{event.title}</h1>
            <p className='text-muted-foreground'>{event.shortDescription}</p>
          </div>
        </div>
      </div>

      <main className='max-w-5xl mx-auto p-6 grid lg:grid-cols-3 gap-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-300'>
        <div className='lg:col-span-2 space-y-6'>
          <Card className='p-6 space-y-4'>
            <h2 className='text-xl font-semibold tracking-tight'>
              About this event
            </h2>
            <p className='leading-relaxed text-gray-700'>{event.description}</p>
          </Card>

          <Card className='p-6 grid sm:grid-cols-3 gap-4'>
            <div className='flex items-start gap-3'>
              <CalendarClock className='h-5 w-5 mt-0.5' />
              <div>
                <div className='text-sm text-muted-foreground'>Date & Time</div>
                <div className='font-medium'>
                  {new Date(event.date).toLocaleString()}
                </div>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <MapPin className='h-5 w-5 mt-0.5' />
              <div>
                <div className='text-sm text-muted-foreground'>Venue</div>
                <div className='font-medium'>{event.venue}</div>
              </div>
            </div>
            <div className='flex items-start gap-3'>
              <User2 className='h-5 w-5 mt-0.5' />
              <div>
                <div className='text-sm text-muted-foreground'>Organizer</div>
                <div className='font-medium'>{event.organizer}</div>
              </div>
            </div>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card className='p-6'>
            <h2 className='text-xl font-semibold tracking-tight mb-4'>
              Register
            </h2>
            {myRegistration ? (
              <div className='flex items-start gap-3 text-green-700'>
                <CheckCircle2 className='h-5 w-5 mt-0.5' />
                <div>
                  <div className='font-medium'>You are registered</div>
                  <div className='text-sm text-muted-foreground'>
                    Submitted on{' '}
                    {new Date(myRegistration.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>Full Name</Label>
                  <Input
                    id='name'
                    value={form.name}
                    onChange={e =>
                      setForm(v => ({ ...v, name: e.target.value }))
                    }
                    required
                    disabled={!isStudent}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={form.email}
                    onChange={e =>
                      setForm(v => ({ ...v, email: e.target.value }))
                    }
                    required
                    disabled={!isStudent}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='sid'>Student ID</Label>
                  <Input
                    id='sid'
                    value={form.studentId}
                    onChange={e =>
                      setForm(v => ({ ...v, studentId: e.target.value }))
                    }
                    disabled={!isStudent}
                  />
                </div>
                <Button
                  type='submit'
                  className='w-full transition-all duration-300 hover:-translate-y-0.5'
                  disabled={!isStudent}
                >
                  Submit Registration
                </Button>
                {!isStudent && (
                  <p className='text-sm text-muted-foreground'>
                    Only students can register. Faculty can manage events from
                    the Events page.
                  </p>
                )}
              </form>
            )}
          </Card>

          <Card className='p-6'>
            <h3 className='text-lg font-semibold mb-2'>Need help?</h3>
            <p className='text-sm text-muted-foreground'>
              For queries, contact the organizer: {event.organizer}
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
