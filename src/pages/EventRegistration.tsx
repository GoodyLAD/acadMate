import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  CalendarClock,
  MapPin,
  User2,
  CheckCircle2,
  Facebook,
  Twitter,
  Mail,
  Calendar,
  QrCode,
  ArrowLeft,
  Play,
  Phone,
  Globe,
  Clock,
} from 'lucide-react';
import { useEvents, useEventRegistration } from '@/hooks/useEvents';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export default function EventRegistration() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getById, events } = useEvents();
  const event = useMemo(() => {
    const found = id ? getById(id) : null;
    return found;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, getById, events]);
  const { profile } = useProfile();
  const { toast } = useToast();

  const { myRegistration, register } = useEventRegistration(event?.id || null);
  const [form, setForm] = useState({ name: '', email: '', studentId: '' });
  const isStudent = profile?.role === 'student';

  if (!event) {
    return (
      <div className='min-h-screen bg-gray-50'>
        <main className='max-w-6xl mx-auto p-6'>
          <Card className='p-8 text-center'>
            <p className='text-lg'>Event not found.</p>
            <p className='text-sm text-gray-500 mt-2'>
              Looking for ID: {id} | Available events: {events.length}
            </p>
            <Button onClick={() => navigate('/events')} className='mt-4'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Events
            </Button>
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.toLocaleDateString('en-US', { weekday: 'long' }),
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      }),
      timezone: 'America/Los Angeles', // You can make this dynamic
    };
  };

  const formatEndTime = (dateString: string, durationHours: number) => {
    const startDate = new Date(dateString);
    const endDate = new Date(
      startDate.getTime() + durationHours * 60 * 60 * 1000
    );
    return endDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const dateInfo = formatDate(event.date);
  const endTime = formatEndTime(event.date, event.durationHours || 2);

  const handleAddToCalendar = () => {
    const startDate = new Date(event.date);
    const endDate = new Date(
      startDate.getTime() + (event.durationHours || 2) * 60 * 60 * 1000
    );

    const formatDateForCalendar = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatDateForCalendar(startDate)}/${formatDateForCalendar(endDate)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;

    window.open(calendarUrl, '_blank');
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this event: ${event.title}`;

    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;
        break;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Back Button */}
      <div className='max-w-6xl mx-auto p-6 pt-8'>
        <Button
          variant='ghost'
          onClick={() => navigate('/events')}
          className='mb-4'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back to Events
        </Button>
      </div>

      {/* Hero Image Section */}
      <div className='relative'>
        <div className='h-80 w-full overflow-hidden'>
          <img
            src={event.bannerUrl || '/placeholder.svg'}
            alt={event.title}
            className='h-full w-full object-cover'
          />
        </div>
      </div>

      {/* Main Content Card */}
      <div className='max-w-6xl mx-auto p-6 -mt-8 relative z-10'>
        <Card className='shadow-xl rounded-2xl overflow-hidden'>
          <div className='grid lg:grid-cols-2'>
            {/* Left Column - Event Information */}
            <div className='p-8 border-r border-dashed border-gray-300 relative'>
              <div className='absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2'>
                <div className='w-4 h-4 bg-gray-300 rounded-full'></div>
              </div>

              <div className='space-y-6'>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900 mb-2'>
                    {event.title}
                  </h1>
                  <p className='text-gray-600'>{event.shortDescription}</p>
                </div>

                {/* Date and Time */}
                <div className='space-y-4'>
                  <div className='flex items-center gap-3'>
                    <div className='w-6 h-6 bg-red-500 rounded-full flex items-center justify-center'>
                      <CalendarClock className='w-3 h-3 text-white' />
                    </div>
                    <div>
                      <div className='font-semibold text-gray-900'>
                        {dateInfo.day}, {dateInfo.date}
                      </div>
                      <div className='text-gray-600'>
                        {dateInfo.time} - {endTime}
                      </div>
                      <div className='text-sm text-gray-500'>
                        ({dateInfo.timezone})
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className='flex items-center gap-3'>
                    <div className='w-6 h-6 bg-red-500 rounded-full flex items-center justify-center'>
                      <MapPin className='w-3 h-3 text-white' />
                    </div>
                    <div>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(event.venue)}`}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-blue-600 hover:text-blue-800 underline'
                      >
                        {event.venue}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Share with Friends */}
                <div className='space-y-3'>
                  <h3 className='font-semibold text-gray-900'>
                    Share With Friends
                  </h3>
                  <div className='flex gap-3'>
                    <button
                      onClick={() => handleShare('facebook')}
                      className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors'
                    >
                      <Facebook className='w-5 h-5 text-gray-600' />
                    </button>
                    <button
                      onClick={() => handleShare('twitter')}
                      className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors'
                    >
                      <Twitter className='w-5 h-5 text-gray-600' />
                    </button>
                    <button
                      onClick={() => handleShare('email')}
                      className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors'
                    >
                      <Mail className='w-5 h-5 text-gray-600' />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Registration */}
            <div className='p-8'>
              <div className='space-y-6'>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900 mb-2'>
                    Subscribe Now
                  </h2>
                  <p className='text-gray-600 mb-4'>
                    Click to Add to your Calendar
                  </p>

                  <Button
                    onClick={handleAddToCalendar}
                    className='w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:-translate-y-0.5'
                  >
                    <Calendar className='w-5 h-5 mr-2' />
                    Add to Calendar
                  </Button>
                </div>

                <div className='text-center text-gray-500 font-medium'>OR</div>

                <div className='text-center space-y-4'>
                  <p className='text-gray-600'>
                    Scan QR with your phone and you will be subscribe
                    automatically
                  </p>
                  <div className='flex justify-center'>
                    {event.qrCodeUrl ? (
                      <img
                        src={event.qrCodeUrl}
                        alt='QR Code'
                        className='w-32 h-32 border border-gray-200 rounded-lg'
                      />
                    ) : (
                      <div className='w-32 h-32 border border-gray-200 rounded-lg flex items-center justify-center bg-gray-50'>
                        <div className='text-center text-gray-500'>
                          <QrCode className='w-8 h-8 mx-auto mb-2' />
                          <div className='text-xs'>No QR Code</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Registration Form */}
                {isStudent && !myRegistration && (
                  <div className='mt-8 p-6 bg-gray-50 rounded-lg'>
                    <h3 className='text-lg font-semibold mb-4'>
                      Register for Event
                    </h3>
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
                        />
                      </div>
                      <Button type='submit' className='w-full'>
                        Submit Registration
                      </Button>
                    </form>
                  </div>
                )}

                {myRegistration && (
                  <div className='mt-8 p-6 bg-green-50 rounded-lg border border-green-200'>
                    <div className='flex items-center gap-3 text-green-700'>
                      <CheckCircle2 className='h-6 w-6' />
                      <div>
                        <div className='font-semibold'>You are registered</div>
                        <div className='text-sm text-green-600'>
                          Submitted on{' '}
                          {new Date(myRegistration.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!isStudent && (
                  <div className='mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200'>
                    <p className='text-sm text-yellow-800'>
                      Only students can register. Faculty can manage events from
                      the Events page.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Event Details Section */}
      <div className='max-w-6xl mx-auto p-6'>
        <div className='grid lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2 space-y-6'>
            {/* Event Details */}
            <Card className='p-6'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Event Details
              </h2>
              <div className='space-y-4 text-gray-700'>
                <p>{event.description}</p>
                <div className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-gray-500' />
                  <span>Duration: {event.durationHours || 2} hours</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='text-xs'>
                    {event.category.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Event Photos and Videos */}
            <Card className='p-6'>
              <h2 className='text-2xl font-bold text-gray-900 mb-4'>
                Event Photos And Videos
              </h2>
              <div className='relative'>
                <img
                  src={event.bannerUrl || '/placeholder.svg'}
                  alt='Event preview'
                  className='w-full h-48 object-cover rounded-lg'
                />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='w-16 h-16 bg-white/80 rounded-full flex items-center justify-center'>
                    <Play className='w-8 h-8 text-gray-700 ml-1' />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Event Organizer */}
          <div className='space-y-6'>
            <Card className='p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center'>
                  <User2 className='w-6 h-6 text-gray-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Event Organizer
                </h3>
              </div>

              <div className='space-y-3'>
                <div className='font-medium text-gray-900'>
                  {event.organizer}
                </div>

                <div className='space-y-2 text-sm'>
                  <div className='flex items-center gap-2'>
                    <Phone className='w-4 h-4 text-gray-500' />
                    <a
                      href='tel:+1234567890'
                      className='text-blue-600 hover:text-blue-800'
                    >
                      (415) 444-3434
                    </a>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Mail className='w-4 h-4 text-gray-500' />
                    <a
                      href='mailto:organizer@example.com'
                      className='text-blue-600 hover:text-blue-800'
                    >
                      organizer@example.com
                    </a>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Globe className='w-4 h-4 text-gray-500' />
                    <a href='#' className='text-blue-600 hover:text-blue-800'>
                      www.organizer.com
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
