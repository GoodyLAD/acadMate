import React, { useMemo, useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEvents } from '@/hooks/useEvents';
import { useProfile } from '@/hooks/useProfile';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  CalendarClock,
  MapPin,
  User2,
  Flame,
  Sparkles,
  MoreVertical,
} from 'lucide-react';

export default function EventsPage() {
  const { events, addEvent, updateEvent, removeEvent } = useEvents();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const isFaculty = profile?.role === 'faculty';
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'academic' as 'academic' | 'co_curricular' | 'outside_university',
    date: '',
    venue: '',
    organizer: '',
    bannerUrl: '',
    qrCodeUrl: '',
    durationHours: 2,
  });

  // Filters: search + category
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<
    'all' | 'academic' | 'co_curricular' | 'outside_university'
  >('all');

  const filtered = useMemo(() => {
    const result = events.filter(e => {
      const nameOk = !q || e.title.toLowerCase().includes(q.toLowerCase());
      const catOk = cat === 'all' || e.category === cat;
      return nameOk && catOk;
    });
    return result;
  }, [events, q, cat]);

  const featured = filtered.slice(0, Math.min(6, filtered.length));

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    shortDescription: '',
    description: '',
    category: 'academic' as 'academic' | 'co_curricular' | 'outside_university',
    date: '',
    venue: '',
    organizer: '',
    bannerUrl: '',
    qrCodeUrl: '',
    durationHours: 2,
  });

  const openEdit = (ev: any) => {
    setEditId(ev.id);
    setEditForm({
      title: ev.title,
      shortDescription: ev.shortDescription,
      description: ev.description,
      category: ev.category,
      date: ev.date,
      venue: ev.venue,
      organizer: ev.organizer,
      bannerUrl: ev.bannerUrl,
      qrCodeUrl: ev.qrCodeUrl || '',
      durationHours: ev.durationHours ?? 2,
    });
    setEditOpen(true);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    updateEvent(editId, { ...editForm });
    setEditOpen(false);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.title ||
      !form.shortDescription ||
      !form.description ||
      !form.date ||
      !form.venue ||
      !form.organizer
    )
      return;
    const id = addEvent({ ...form });
    setOpen(false);
    setForm({
      title: '',
      shortDescription: '',
      description: '',
      category: 'academic',
      date: '',
      venue: '',
      organizer: '',
      bannerUrl: '',
      qrCodeUrl: '',
      durationHours: 2,
    });
    window.location.href = `/events/${id}`;
  };

  const CategoryBar = () => (
    <div className='rounded-2xl border bg-white p-3 shadow-sm'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center'>
        <div className='md:flex-1'>
          <Input
            placeholder='Search events'
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div className='w-full md:w-56'>
          <Select value={cat} onValueChange={v => setCat(v as any)}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='All Categories' />
            </SelectTrigger>
            <SelectContent side='bottom' align='start'>
              <SelectItem value='all'>All Categories</SelectItem>
              <SelectItem value='academic'>Academic</SelectItem>
              <SelectItem value='co_curricular'>Co-Curricular</SelectItem>
              <SelectItem value='outside_university'>
                Outside University
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const EventCard = (ev: any) => {
    const { id, bannerUrl, title, shortDescription, date, venue, organizer } =
      ev;
    return (
      <Card
        className='group overflow-hidden border border-gray-200/70 hover:border-gray-300 transition-all duration-300 hover:shadow-xl rounded-2xl bg-white cursor-pointer'
        onClick={() => navigate(`/event-registration/${id}`)}
      >
        <div className='relative h-40 w-full overflow-hidden'>
          <img
            src={bannerUrl || '/placeholder.svg'}
            alt={title}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        </div>
        <CardHeader className='pb-2'>
          <div className='flex items-start justify-between gap-3'>
            <div>
              <CardTitle className='text-lg font-semibold tracking-tight'>
                {title}
              </CardTitle>
              <CardDescription>{shortDescription}</CardDescription>
            </div>
            {isFaculty && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-8 w-8'
                    onClick={e => e.stopPropagation()}
                  >
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={() => openEdit(ev)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-red-600'
                    onClick={() => removeEvent(id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        <CardContent className='pt-0 space-y-3'>
          <div className='flex flex-col gap-2 text-sm text-muted-foreground'>
            <div className='flex items-center gap-2'>
              <CalendarClock className='h-4 w-4' />{' '}
              {new Date(date).toLocaleString()}
            </div>
            <div className='flex items-center gap-2'>
              <MapPin className='h-4 w-4' /> {venue}
            </div>
            <div className='flex items-center gap-2'>
              <User2 className='h-4 w-4' /> {organizer}
            </div>
          </div>
          <div className='flex items-center justify-between pt-2'>
            <Button
              className='w-full transition-all duration-300 hover:-translate-y-0.5'
              onClick={e => {
                e.stopPropagation();
                navigate(`/event-registration/${id}`);
              }}
            >
              Register Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      <main className='max-w-7xl mx-auto p-6 space-y-10 animate-in fade-in-50 slide-in-from-bottom-2 duration-300'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex-1'>
            <CategoryBar />
          </div>
          {isFaculty && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className='gap-2'>
                  <Plus className='h-4 w-4' /> Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className='sm:max-w-lg'>
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className='space-y-4'>
                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='title'>Title</Label>
                      <Input
                        id='title'
                        value={form.title}
                        onChange={e =>
                          setForm(v => ({ ...v, title: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='category'>Category</Label>
                      <select
                        id='category'
                        className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                        value={form.category}
                        onChange={e =>
                          setForm(v => ({
                            ...v,
                            category: e.target.value as any,
                          }))
                        }
                      >
                        <option value='academic'>Academic</option>
                        <option value='co_curricular'>Co-Curricular</option>
                        <option value='outside_university'>
                          Outside University
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='short'>Short Description</Label>
                    <Input
                      id='short'
                      value={form.shortDescription}
                      onChange={e =>
                        setForm(v => ({
                          ...v,
                          shortDescription: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='desc'>Detailed Description</Label>
                    <Textarea
                      id='desc'
                      value={form.description}
                      onChange={e =>
                        setForm(v => ({ ...v, description: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='date'>Date & Time</Label>
                      <Input
                        id='date'
                        type='datetime-local'
                        value={form.date}
                        onChange={e =>
                          setForm(v => ({ ...v, date: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='venue'>Venue</Label>
                      <Input
                        id='venue'
                        value={form.venue}
                        onChange={e =>
                          setForm(v => ({ ...v, venue: e.target.value }))
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className='grid sm:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='organizer'>Organizer</Label>
                      <Input
                        id='organizer'
                        value={form.organizer}
                        onChange={e =>
                          setForm(v => ({ ...v, organizer: e.target.value }))
                        }
                        required
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='banner'>Banner Image</Label>
                      <input
                        id='banner'
                        type='file'
                        accept='image/*'
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          const r = new FileReader();
                          r.onload = () =>
                            setForm(v => ({
                              ...v,
                              bannerUrl: String(r.result),
                            }));
                          r.readAsDataURL(f);
                        }}
                        className='block w-full text-sm'
                      />
                      {form.bannerUrl && (
                        <img
                          src={form.bannerUrl}
                          alt='Preview'
                          className='mt-2 h-24 w-full object-cover rounded-md border'
                        />
                      )}
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='qrCode'>QR Code Image</Label>
                    <input
                      id='qrCode'
                      type='file'
                      accept='image/*'
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const r = new FileReader();
                        r.onload = () =>
                          setForm(v => ({ ...v, qrCodeUrl: String(r.result) }));
                        r.readAsDataURL(f);
                      }}
                      className='block w-full text-sm'
                    />
                    {form.qrCodeUrl && (
                      <img
                        src={form.qrCodeUrl}
                        alt='QR Code Preview'
                        className='mt-2 h-24 w-24 object-cover rounded-md border'
                      />
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='duration'>Duration (hours)</Label>
                    <Input
                      id='duration'
                      type='number'
                      min={0.5}
                      step={0.5}
                      value={form.durationHours}
                      onChange={e =>
                        setForm(v => ({
                          ...v,
                          durationHours: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className='flex justify-end gap-2'>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => setOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type='submit'>Create</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Hero Section */}
        <section className='relative overflow-hidden rounded-3xl bg-black text-white'>
          <img
            src='https://images.unsplash.com/photo-1518600506278-4e8ef466b810?q=80&w=1600&auto=format&fit=crop'
            alt='Hero'
            className='absolute inset-0 h-full w-full object-cover opacity-60'
          />
          <div className='relative p-8 sm:p-12'>
            <div className='space-y-4'>
              <Badge variant='secondary' className='bg-white/90 text-black'>
                Premium
              </Badge>
              <h1 className='text-4xl sm:text-5xl font-bold tracking-tight'>
                Discover World-Class Events
              </h1>
              <p className='text-white/90 text-lg'>
                Curated academic and co‑curricular experiences with a luxury
                touch.
              </p>
              <a href='#explore'>
                <Button
                  size='lg'
                  className='mt-2 bg-white text-black hover:bg-white/90 transition-all duration-300 hover:-translate-y-0.5'
                >
                  Register Now
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Limited-time Promo */}
        <section className='rounded-2xl bg-gradient-to-r from-amber-100 via-white to-amber-100 border p-6 sm:p-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-3'>
            <Flame className='h-6 w-6 text-amber-600' />
            <h2 className='text-2xl font-semibold tracking-tight'>
              Early-bird registrations are live
            </h2>
          </div>
          <p className='text-muted-foreground max-w-xl'>
            Save your spot for premium experiences. Limited seats available for
            select events.
          </p>
          <a href='#explore'>
            <Button>Register Now</Button>
          </a>
        </section>

        {/* Featured Carousel */}
        {featured.length > 0 && (
          <section aria-label='Featured events' className='relative'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-xl font-semibold tracking-tight'>Featured</h3>
              <div className='text-sm text-muted-foreground'>
                Top picks for you
              </div>
            </div>
            <Carousel opts={{ align: 'start' }} className='overflow-x-hidden'>
              <CarouselContent>
                {featured.map(ev => (
                  <CarouselItem
                    key={ev.id}
                    className='md:basis-1/2 lg:basis-1/3'
                  >
                    <EventCard {...ev} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className='left-2 top-1/2 -translate-y-1/2' />
              <CarouselNext className='right-2 top-1/2 -translate-y-1/2' />
            </Carousel>
          </section>
        )}

        {/* Explore Grid */}
        <section id='explore' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-semibold tracking-tight'>
                Explore Events
              </h2>
              <p className='text-muted-foreground'>
                Browse by category ({events.length} total events,{' '}
                {filtered.length} filtered)
              </p>
            </div>
            <div className='hidden sm:flex items-center gap-2 text-amber-600'>
              <Sparkles className='h-4 w-4' /> Luxury-curated experience
            </div>
          </div>
          <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {filtered.length > 0 ? (
              filtered.map(ev => <EventCard key={ev.id} {...ev} />)
            ) : (
              <div className='col-span-full text-center py-12'>
                <p className='text-lg text-gray-500'>No events found</p>
                <p className='text-sm text-gray-400 mt-2'>
                  {events.length === 0
                    ? 'No events available'
                    : 'Try adjusting your search or filters'}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Edit Dialog */}
        {isFaculty && (
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className='sm:max-w-lg'>
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEdit} className='space-y-4'>
                <div className='grid sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='etitle'>Title</Label>
                    <Input
                      id='etitle'
                      value={editForm.title}
                      onChange={e =>
                        setEditForm(v => ({ ...v, title: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='ecategory'>Category</Label>
                    <select
                      id='ecategory'
                      className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
                      value={editForm.category}
                      onChange={e =>
                        setEditForm(v => ({
                          ...v,
                          category: e.target.value as any,
                        }))
                      }
                    >
                      <option value='academic'>Academic</option>
                      <option value='co_curricular'>Co-Curricular</option>
                      <option value='outside_university'>
                        Outside University
                      </option>
                    </select>
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='eshort'>Short Description</Label>
                  <Input
                    id='eshort'
                    value={editForm.shortDescription}
                    onChange={e =>
                      setEditForm(v => ({
                        ...v,
                        shortDescription: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='edesc'>Detailed Description</Label>
                  <Textarea
                    id='edesc'
                    value={editForm.description}
                    onChange={e =>
                      setEditForm(v => ({ ...v, description: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className='grid sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='edate'>Date & Time</Label>
                    <Input
                      id='edate'
                      type='datetime-local'
                      value={editForm.date}
                      onChange={e =>
                        setEditForm(v => ({ ...v, date: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='evenue'>Venue</Label>
                    <Input
                      id='evenue'
                      value={editForm.venue}
                      onChange={e =>
                        setEditForm(v => ({ ...v, venue: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className='grid sm:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='eorg'>Organizer</Label>
                    <Input
                      id='eorg'
                      value={editForm.organizer}
                      onChange={e =>
                        setEditForm(v => ({ ...v, organizer: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='ebanner'>Banner Image</Label>
                    <input
                      id='ebanner'
                      type='file'
                      accept='image/*'
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const r = new FileReader();
                        r.onload = () =>
                          setEditForm(v => ({
                            ...v,
                            bannerUrl: String(r.result),
                          }));
                        r.readAsDataURL(f);
                      }}
                      className='block w-full text-sm'
                    />
                    {editForm.bannerUrl && (
                      <img
                        src={editForm.bannerUrl}
                        alt='Preview'
                        className='mt-2 h-24 w-full object-cover rounded-md border'
                      />
                    )}
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='eqrCode'>QR Code Image</Label>
                  <input
                    id='eqrCode'
                    type='file'
                    accept='image/*'
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = () =>
                        setEditForm(v => ({
                          ...v,
                          qrCodeUrl: String(r.result),
                        }));
                      r.readAsDataURL(f);
                    }}
                    className='block w-full text-sm'
                  />
                  {editForm.qrCodeUrl && (
                    <img
                      src={editForm.qrCodeUrl}
                      alt='QR Code Preview'
                      className='mt-2 h-24 w-24 object-cover rounded-md border'
                    />
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='edur'>Duration (hours)</Label>
                  <Input
                    id='edur'
                    type='number'
                    min={0.5}
                    step={0.5}
                    value={editForm.durationHours}
                    onChange={e =>
                      setEditForm(v => ({
                        ...v,
                        durationHours: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className='flex justify-end gap-2'>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type='submit'>Save</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Bottom Promos */}
        <section className='grid gap-6 md:grid-cols-2'>
          <Card className='relative overflow-hidden rounded-3xl border bg-white'>
            <img
              src='https://images.unsplash.com/photo-1529336953121-c9e3f9a8ed3a?q=80&w=1600&auto=format&fit=crop'
              alt='Promo'
              className='absolute inset-0 h-full w-full object-cover opacity-20'
            />
            <CardContent className='p-6 relative'>
              <Badge className='mb-3'>Trending</Badge>
              <h3 className='text-xl font-semibold tracking-tight'>
                Hands-on AI Workshop
              </h3>
              <p className='text-muted-foreground'>
                Get practical with guided labs and expert mentors.
              </p>
              <div className='mt-4'>
                <Button variant='secondary'>Register</Button>
              </div>
            </CardContent>
          </Card>
          <Card className='relative overflow-hidden rounded-3xl border bg-white'>
            <img
              src='https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=1600&auto=format&fit=crop'
              alt='Promo'
              className='absolute inset-0 h-full w-full object-cover opacity-20'
            />
            <CardContent className='p-6 relative'>
              <Badge variant='destructive' className='mb-3'>
                Hot
              </Badge>
              <h3 className='text-xl font-semibold tracking-tight'>
                Cultural Night VIP
              </h3>
              <p className='text-muted-foreground'>
                Exclusive seating and backstage access.
              </p>
              <div className='mt-4'>
                <Button variant='secondary'>Register</Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
