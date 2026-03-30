import { useEffect, useMemo, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfileAvatarUrl } from '@/utils/avatarUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import {
  Bell,
  Moon,
  Sun,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Clock,
  Award,
  BookOpen,
  Users,
  Globe,
  ExternalLink,
  Star,
  GraduationCap,
  Briefcase,
  Languages,
  Trophy,
  FileText,
} from 'lucide-react';
import { useTheme } from 'next-themes';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SORT_KEYS = ['name', 'department', 'recent'] as const;

const BK_KEY = (id: string) => `fac_bookmarks_${id}`;
const BL_KEY = (id: string) => `fac_blocked_${id}`;
const CNV_KEY = (id: string) => `fac_contacts_${id}`;

// Helper function to get subjects based on department
const getSubjectsForDepartment = (department: string): string[] => {
  const subjectMap: Record<string, string[]> = {
    CSE: [
      'Programming',
      'Data Structures',
      'Algorithms',
      'Database Systems',
      'Software Engineering',
    ],
    ECE: [
      'Digital Electronics',
      'Signals & Systems',
      'Communication Systems',
      'VLSI Design',
      'Microprocessors',
    ],
    EEE: [
      'Electrical Circuits',
      'Power Systems',
      'Control Systems',
      'Electrical Machines',
      'Power Electronics',
    ],
    Mechanical: [
      'Thermodynamics',
      'Fluid Mechanics',
      'Machine Design',
      'Manufacturing',
      'CAD/CAM',
    ],
    Civil: [
      'Structural Analysis',
      'Concrete Technology',
      'Geotechnical Engineering',
      'Transportation',
      'Environmental Engineering',
    ],
    AIML: [
      'Machine Learning',
      'Artificial Intelligence',
      'Deep Learning',
      'Data Science',
      'Neural Networks',
    ],
    IT: [
      'Web Development',
      'Database Management',
      'Network Security',
      'Cloud Computing',
      'Mobile Development',
    ],
    MBA: [
      'Business Management',
      'Marketing',
      'Finance',
      'Human Resources',
      'Operations Management',
    ],
    Maths: [
      'Calculus',
      'Linear Algebra',
      'Statistics',
      'Discrete Mathematics',
      'Numerical Methods',
    ],
    Physics: [
      'Mechanics',
      'Thermodynamics',
      'Electromagnetism',
      'Quantum Physics',
      'Optics',
    ],
    Chemistry: [
      'Organic Chemistry',
      'Inorganic Chemistry',
      'Physical Chemistry',
      'Analytical Chemistry',
      'Biochemistry',
    ],
  };
  return subjectMap[department] || ['General Studies'];
};

interface FacultyMeta {
  id: string;
  full_name: string;
  email: string;
  department?: string;
  sections?: string[];
  subjects?: string[];
  updated_at?: string;
  avatar_url?: string | null;
  // Enhanced faculty details
  designation?: string;
  qualification?: string;
  experience?: number;
  research_areas?: string[];
  publications?: number;
  phone?: string;
  office_location?: string;
  office_hours?: string;
  bio?: string;
  achievements?: string[];
  social_links?: {
    linkedin?: string;
    google_scholar?: string;
    research_gate?: string;
    orcid?: string;
  };
  teaching_experience?: number;
  awards?: string[];
  certifications?: string[];
  languages?: string[];
  availability?: 'available' | 'busy' | 'away' | 'offline';
}
interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

const MOCK_FACULTIES: FacultyMeta[] = [];

import { Link, useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export default function FacultyCommunity() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const myId = profile?.id ?? '';
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState<FacultyMeta[]>([]);
  const [search, setSearch] = useState('');
  const [filterDept, setFilterDept] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [sortBy, setSortBy] = useState<(typeof SORT_KEYS)[number]>('recent');

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMeta | null>(
    null
  );

  const [conversations, setConversations] = useState<string[]>([]); // faculty ids
  const [activePeerId, setActivePeerId] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [messages, setMessages] = useState<MessageRow[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [newMsg, setNewMsg] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const chatRef = useRef<HTMLDivElement | null>(null);

  // Load bookmarks/blocked
  useEffect(() => {
    if (!myId) return;
    try {
      setBookmarks(JSON.parse(localStorage.getItem(BK_KEY(myId)) || '[]'));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* ignore */
    }
    try {
      setBlocked(JSON.parse(localStorage.getItem(BL_KEY(myId)) || '[]'));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* ignore */
    }
  }, [myId]);

  useEffect(() => {
    if (myId) localStorage.setItem(BK_KEY(myId), JSON.stringify(bookmarks));
  }, [bookmarks, myId]);
  useEffect(() => {
    if (myId) localStorage.setItem(BL_KEY(myId), JSON.stringify(blocked));
  }, [blocked, myId]);

  // Fetch faculties from database and merge with enhanced mock data
  useEffect(() => {
    (async () => {
      try {
        // Fetch real faculty data from database - use only basic fields that exist
        const dbResult = await supabase
          .from('profiles')
          .select('id, full_name, email, updated_at, role')
          .eq('role', 'faculty');
        let data = dbResult.data;
        const error = dbResult.error;
        // Fallback: Get all profiles to debug what's actually in the database
        if (!data || data.length === 0) {
          const { data: allProfiles } = await supabase
            .from('profiles')
            .select('id, full_name, email, updated_at, role');
          if (allProfiles && allProfiles.length > 0) {
            // Filter for faculty-like roles or specific users
            const facultyProfiles = allProfiles.filter(
              p =>
                p.role === 'faculty' ||
                p.full_name?.toLowerCase().includes('dev') ||
                p.full_name?.toLowerCase().includes('karan')
            );
            if (facultyProfiles.length > 0) {
              // Use the filtered profiles as data
              data = facultyProfiles;
            }
          }
        }

        let allFaculties: FacultyMeta[] = [...MOCK_FACULTIES]; // Start with mock data

        if (!error && data && data.length > 0) {
          // Convert database faculty to FacultyMeta format and merge with mock data
          const dbFaculties: FacultyMeta[] = data.map(
            (p: any, index: number) => {
              // Assign varied departments to database faculty
              const departments = [
                'CSE',
                'ECE',
                'EEE',
                'Mechanical',
                'Civil',
                'AIML',
                'IT',
                'MBA',
                'Maths',
                'Physics',
                'Chemistry',
              ];
              const assignedDept = departments[index % departments.length];

              return {
                id: p.id,
                full_name: p.full_name,
                email: p.email,
                updated_at: p.updated_at,
                avatar_url: p.avatar_url, // Use actual avatar_url from database
                department: assignedDept, // Varied department assignment
                sections: [`${assignedDept}-1`, `${assignedDept}-2`], // Department-specific sections
                subjects: getSubjectsForDepartment(assignedDept), // Department-specific subjects
                // Add default values for fields not in database
                designation: 'Faculty Member',
                qualification: 'Academic Qualification',
                experience: 5, // Default experience
                research_areas: ['General Research'],
                publications: 0,
                phone: '',
                office_location: '',
                office_hours: '9:00 AM - 5:00 PM',
                bio: `Faculty member in ${assignedDept} department.`,
                achievements: [],
                social_links: {},
                teaching_experience: 5,
                awards: [],
                certifications: [],
                languages: ['English'],
                availability: 'available',
              };
            }
          );
          // Merge database faculty with mock data, avoiding duplicates
          const mockIds = new Set(MOCK_FACULTIES.map(f => f.id));
          const uniqueDbFaculties = dbFaculties.filter(f => !mockIds.has(f.id));
          allFaculties = [...MOCK_FACULTIES, ...uniqueDbFaculties];

          toast({
            title: 'Faculty Directory Loaded',
            description: `Loaded ${allFaculties.length} faculty members (${MOCK_FACULTIES.length} sample + ${uniqueDbFaculties.length} from database).`,
          });
        } else {
          // If database fails, use only mock data
          toast({
            title: 'Faculty Directory Loaded',
            description: `Loaded ${MOCK_FACULTIES.length} faculty members with comprehensive sample data.`,
          });
        }

        setFaculties(allFaculties);
      } catch (err) {
        console.error('Load faculties err', err);
        setFaculties(MOCK_FACULTIES);
        toast({
          title: 'Using Mock Data',
          description:
            'Faculty directory loaded with comprehensive sample data.',
        });
      }
    })();
  }, [toast]);

  // Conversations list (peers with whom we exchanged messages)
  useEffect(() => {
    if (!myId) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('sender_id, receiver_id, read_at, created_at')
          .or(`sender_id.eq.${myId},receiver_id.eq.${myId}`)
          .order('created_at', { ascending: false });
        if (error) {
          console.error('Load conv error', error);
        }
        const peers = new Set<string>();
        let unread = 0;
        const counts: Record<string, number> = {};
        (data || []).forEach((m: any) => {
          const other = m.sender_id === myId ? m.receiver_id : m.sender_id;
          peers.add(other);
          if (!m.read_at && m.receiver_id === myId) {
            unread++;
            counts[m.sender_id] = (counts[m.sender_id] || 0) + 1;
          }
        });
        const convs = Array.from(peers);
        // demo fallback if no conversations from DB
        if (!convs.length) {
          const demo = MOCK_FACULTIES.slice(0, 3).map(f => f.id);
          setConversations(demo);
        } else {
          setConversations(convs);
        }
        setUnreadCount(unread);
        setUnreadCounts(counts);
      } catch (err) {
        console.error('Load conv err', err);
        setConversations(MOCK_FACULTIES.slice(0, 3).map(f => f.id));
      }
    })();
  }, [myId]);

  // Real-time subscription for messages
  useEffect(() => {
    if (!myId) return;

    const channel = supabase
      .channel('faculty_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_id.eq.${myId},receiver_id.eq.${myId})`,
        },
        payload => {
          const newMessage = payload.new as MessageRow;

          // Update unread counts
          if (newMessage.receiver_id === myId) {
            const senderId = newMessage.sender_id;
            setUnreadCounts(prev => ({
              ...prev,
              [senderId]: (prev[senderId] || 0) + 1,
            }));
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .subscribe(() => {});

    return () => {
      supabase.removeChannel(channel);
    };
  }, [myId]);

  // Fallback polling for unread counts (every 5 seconds)
  useEffect(() => {
    if (!myId) return;

    const pollUnreadCounts = async () => {
      try {
        const { data } = await supabase
          .from('messages')
          .select('sender_id, receiver_id, read_at')
          .eq('receiver_id', myId)
          .is('read_at', null);

        const counts: Record<string, number> = {};
        let totalUnread = 0;
        (data || []).forEach(msg => {
          counts[msg.sender_id] = (counts[msg.sender_id] || 0) + 1;
          totalUnread++;
        });
        setUnreadCounts(counts);
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Polling unread counts error:', error);
      }
    };

    // Poll every 5 seconds as fallback
    const interval = setInterval(pollUnreadCounts, 5000);

    return () => clearInterval(interval);
  }, [myId]);

  // Load messages for active peer
  useEffect(() => {
    if (!myId || !activePeerId) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .or(
            `and(sender_id.eq.${myId},receiver_id.eq.${activePeerId}),and(sender_id.eq.${activePeerId},receiver_id.eq.${myId})`
          )
          .order('created_at', { ascending: true });
        if (error) {
          console.error('Load messages error', error);
          return;
        }
        const rows = (data || []) as MessageRow[];
        setMessages(rows);
        // mark reads
        const unreadIds = rows
          .filter(r => r.receiver_id === myId && !r.read_at)
          .map(r => r.id);
        if (unreadIds.length) {
          await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadIds);
        }
        setUnreadCount(prev => Math.max(0, prev - unreadIds.length));
        setTimeout(
          () =>
            chatRef.current?.scrollTo({
              top: chatRef.current.scrollHeight,
              behavior: 'smooth',
            }),
          50
        );
      } catch (err) {
        console.error('Load messages err', err);
      }
    })();
  }, [myId, activePeerId]);

  // If conversations filled by demo and no active peer yet, preselect first
  useEffect(() => {
    if (!activePeerId && conversations.length) {
      setActivePeerId(conversations[0]);
    }
  }, [conversations, activePeerId]);

  // Generate dynamic departments list from actual faculty data
  const availableDepartments = useMemo(() => {
    const deptSet = new Set<string>();
    faculties.forEach(f => {
      if (f.department) {
        deptSet.add(f.department);
      }
    });
    return Array.from(deptSet).sort();
  }, [faculties]);

  const filteredFaculties = useMemo(() => {
    let list = faculties.slice();
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        f =>
          f.full_name.toLowerCase().includes(q) ||
          f.email.toLowerCase().includes(q) ||
          (f.department || '').toLowerCase().includes(q) ||
          (f.subjects || []).join(' ').toLowerCase().includes(q) ||
          (f.sections || []).join(' ').toLowerCase().includes(q)
      );
    }
    if (filterDept !== 'all') {
      list = list.filter(f => (f.department || '') === filterDept);
    }
    if (filterSection) {
      list = list.filter(f =>
        (f.sections || []).some(s =>
          s.toLowerCase().includes(filterSection.toLowerCase())
        )
      );
    }
    if (filterSubject) {
      list = list.filter(f =>
        (f.subjects || []).some(s =>
          s.toLowerCase().includes(filterSubject.toLowerCase())
        )
      );
    }
    if (sortBy === 'name') {
      list.sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (sortBy === 'department') {
      list.sort((a, b) =>
        (a.department || '').localeCompare(b.department || '')
      );
    } else {
      list.sort((a, b) =>
        (b.updated_at || '').localeCompare(a.updated_at || '')
      );
    }
    return list;
  }, [faculties, search, filterDept, filterSection, filterSubject, sortBy]);

  const onMessage = (fid: string) => {
    if (blocked.includes(fid)) {
      toast({
        title: 'Blocked',
        description: 'You have blocked this faculty. Unblock to message.',
        variant: 'destructive',
      });
      return;
    }
    try {
      if (myId) {
        const key = CNV_KEY(myId);
        const list: string[] = JSON.parse(localStorage.getItem(key) || '[]');
        if (!list.includes(fid)) {
          localStorage.setItem(key, JSON.stringify([fid, ...list]));
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* ignore */
    }
    navigate(`/faculty/chat?peer=${encodeURIComponent(fid)}`);
  };

  const getAvailabilityStatus = (f: FacultyMeta) => {
    if (f.availability) {
      return f.availability;
    }
    // Fallback to old logic
    const ts = f.updated_at ? new Date(f.updated_at).getTime() : 0;
    return Date.now() - ts < 1000 * 60 * 60 * 24 ? 'available' : 'offline';
  };

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'away':
        return 'bg-orange-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'busy':
        return 'Busy';
      case 'away':
        return 'Away';
      case 'offline':
        return 'Offline';
      default:
        return 'Offline';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-[#0b1020]'>
      <header className='sticky top-16 z-10 bg-white/80 dark:bg-[#0b1020]/80 backdrop-blur border-b'>
        <div className='max-w-7xl mx-auto p-5 flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <Input
              placeholder='Search by name, department, section, subject'
              value={search}
              onChange={e => setSearch(e.target.value)}
              className='w-[340px]'
            />
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue placeholder='Department' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Departments</SelectItem>
                {availableDepartments.map(d => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder='Section'
              value={filterSection}
              onChange={e => setFilterSection(e.target.value)}
              className='w-[140px]'
            />
            <Input
              placeholder='Subject'
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className='w-[180px]'
            />
            <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
              <SelectTrigger className='w-[160px]'>
                <SelectValue>
                  Sort:{' '}
                  {sortBy === 'recent'
                    ? 'Recently Active'
                    : sortBy === 'name'
                      ? 'Name'
                      : 'Department'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='recent'>Recently Active</SelectItem>
                <SelectItem value='name'>Name</SelectItem>
                <SelectItem value='department'>Department</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className='flex items-center gap-3'>
            <Button
              variant='ghost'
              size='icon'
              aria-label='Toggle theme'
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? (
                <Sun className='h-4 w-4' />
              ) : (
                <Moon className='h-4 w-4' />
              )}
            </Button>
            <div className='relative'>
              <Button variant='ghost' size='icon' aria-label='Notifications'>
                <Bell className='h-4 w-4' />
              </Button>
              {unreadCount > 0 && (
                <span className='absolute -top-1 -right-1 text-[10px] bg-red-600 text-white rounded-full px-1'>
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-7xl mx-auto p-4 grid grid-cols-12 gap-4'>
        {/* Directory */}
        <section className='col-span-12'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <span>Faculty Directory</span>
                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                    <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                      Live
                    </span>
                    <span>Database Faculty</span>
                  </div>
                </div>
                <span className='text-sm font-normal text-muted-foreground'>
                  {filteredFaculties.length} faculty member
                  {filteredFaculties.length !== 1 ? 's' : ''}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Faculty Grid - All screen sizes */}
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {filteredFaculties.map(f => {
                  const unreadCount = unreadCounts[f.id] || 0;
                  return (
                    <div
                      key={f.id}
                      className='border rounded-xl p-4 bg-white dark:bg-[#0f1530] hover:shadow-lg transition relative group'
                    >
                      {/* Database faculty indicator */}
                      {!MOCK_FACULTIES.some(mock => mock.id === f.id) && (
                        <div className='absolute top-2 right-2'>
                          <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                            Live
                          </span>
                        </div>
                      )}
                      <div className='flex flex-col items-center text-center space-y-3'>
                        <div className='relative'>
                          <Avatar className='h-16 w-16'>
                            <AvatarImage
                              src={getProfileAvatarUrl({
                                avatar_url: f.avatar_url,
                                full_name: f.full_name,
                                role: 'faculty',
                              })}
                              alt={f.full_name}
                            />
                            <AvatarFallback className='text-lg'>
                              {f.full_name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ring-2 ring-white ${getAvailabilityColor(getAvailabilityStatus(f))}`}
                          />
                        </div>
                        <div className='space-y-1'>
                          <div className='font-semibold text-sm'>
                            {f.full_name}
                          </div>
                          <div className='text-xs text-muted-foreground font-medium'>
                            {f.designation || f.department || '—'}
                          </div>
                          <div className='text-xs text-muted-foreground'>
                            {f.department || '—'}
                          </div>
                          {f.experience && (
                            <div className='text-[11px] text-muted-foreground flex items-center gap-1'>
                              <Briefcase className='h-3 w-3' />
                              {f.experience} years exp
                            </div>
                          )}
                          {f.publications && (
                            <div className='text-[11px] text-muted-foreground flex items-center gap-1'>
                              <BookOpen className='h-3 w-3' />
                              {f.publications} publications
                            </div>
                          )}
                          {(f.subjects || []).length > 0 && (
                            <div className='text-[11px] text-muted-foreground flex items-center gap-1'>
                              <GraduationCap className='h-3 w-3' />
                              {f.subjects.slice(0, 2).join(', ')}
                              {f.subjects.length > 2 &&
                                ` +${f.subjects.length - 2} more`}
                            </div>
                          )}
                          {(f.sections || []).length > 0 && (
                            <div className='text-[11px] text-muted-foreground flex items-center gap-1'>
                              <Users className='h-3 w-3' />
                              {f.sections.slice(0, 2).join(', ')}
                              {f.sections.length > 2 &&
                                ` +${f.sections.length - 2} more`}
                            </div>
                          )}
                          {(f.research_areas || []).length > 0 && (
                            <div className='text-[10px] text-muted-foreground'>
                              Research:{' '}
                              {f.research_areas.slice(0, 1).join(', ')}
                              {f.research_areas.length > 1 &&
                                ` +${f.research_areas.length - 1} more`}
                            </div>
                          )}
                          <div
                            className={`text-[10px] font-medium flex items-center gap-1 ${getAvailabilityStatus(f) === 'available' ? 'text-green-600' : getAvailabilityStatus(f) === 'busy' ? 'text-yellow-600' : getAvailabilityStatus(f) === 'away' ? 'text-orange-600' : 'text-gray-500'}`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${getAvailabilityColor(getAvailabilityStatus(f))}`}
                            ></span>
                            {getAvailabilityText(getAvailabilityStatus(f))}
                          </div>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Button
                            size='sm'
                            variant='outline'
                            onClick={e => {
                              e.stopPropagation();
                              onMessage(f.id);
                            }}
                            className='relative'
                          >
                            <MessageCircle className='h-4 w-4 mr-1' />
                            Chat
                            {unreadCount > 0 && (
                              <div className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium'>
                                {unreadCount > 99 ? '99+' : unreadCount}
                              </div>
                            )}
                          </Button>
                          <Button
                            size='sm'
                            variant='ghost'
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedFaculty(f);
                              setProfileOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!filteredFaculties.length && (
                  <div className='col-span-full text-center py-8 text-sm text-muted-foreground'>
                    No faculty found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Link to='/faculty/chat' className='fixed bottom-6 right-6'>
        <Button size='lg' className='shadow-lg rounded-full'>
          Conversations
          {unreadCount > 0 && (
            <span className='ml-2 text-[10px] bg-red-600 text-white rounded-full px-1'>
              {unreadCount}
            </span>
          )}
        </Button>
      </Link>
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          {selectedFaculty && (
            <div className='space-y-6'>
              {/* Header Section */}
              <DialogHeader>
                <div className='flex items-start gap-4'>
                  <div className='relative'>
                    <Avatar className='h-20 w-20'>
                      <AvatarImage
                        src={getProfileAvatarUrl({
                          avatar_url: selectedFaculty.avatar_url,
                          full_name: selectedFaculty.full_name,
                          role: 'faculty',
                        })}
                        alt={selectedFaculty.full_name}
                      />
                      <AvatarFallback className='text-2xl'>
                        {selectedFaculty.full_name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <span
                      className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full ring-2 ring-white ${getAvailabilityColor(getAvailabilityStatus(selectedFaculty))}`}
                    />
                  </div>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <DialogTitle className='text-2xl'>
                        {selectedFaculty.full_name}
                      </DialogTitle>
                      {/* Database faculty indicator */}
                      {!MOCK_FACULTIES.some(
                        mock => mock.id === selectedFaculty.id
                      ) && (
                        <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                          Live Faculty
                        </span>
                      )}
                    </div>
                    <DialogDescription className='text-lg'>
                      {selectedFaculty.designation ||
                        selectedFaculty.department ||
                        '—'}
                    </DialogDescription>
                    <div className='flex items-center gap-4 mt-2'>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityStatus(selectedFaculty) === 'available' ? 'bg-green-100 text-green-800' : getAvailabilityStatus(selectedFaculty) === 'busy' ? 'bg-yellow-100 text-yellow-800' : getAvailabilityStatus(selectedFaculty) === 'away' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}
                      >
                        ●{' '}
                        {getAvailabilityText(
                          getAvailabilityStatus(selectedFaculty)
                        )}
                      </span>
                      {selectedFaculty.experience && (
                        <span className='text-sm text-muted-foreground'>
                          {selectedFaculty.experience} years experience
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {/* Contact Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Mail className='h-5 w-5' />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Mail className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm'>{selectedFaculty.email}</span>
                    </div>
                    {selectedFaculty.phone && (
                      <div className='flex items-center gap-2'>
                        <Phone className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>{selectedFaculty.phone}</span>
                      </div>
                    )}
                    {selectedFaculty.office_location && (
                      <div className='flex items-center gap-2'>
                        <MapPin className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>
                          {selectedFaculty.office_location}
                        </span>
                      </div>
                    )}
                    {selectedFaculty.office_hours && (
                      <div className='flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-muted-foreground' />
                        <span className='text-sm'>
                          {selectedFaculty.office_hours}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <GraduationCap className='h-5 w-5' />
                      Academic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-3'>
                    {selectedFaculty.qualification && (
                      <div className='text-sm'>
                        <span className='font-medium'>Qualification:</span>
                        <p className='text-muted-foreground mt-1'>
                          {selectedFaculty.qualification}
                        </p>
                      </div>
                    )}
                    {selectedFaculty.department && (
                      <div className='text-sm'>
                        <span className='font-medium'>Department:</span>
                        <p className='text-muted-foreground'>
                          {selectedFaculty.department}
                        </p>
                      </div>
                    )}
                    {selectedFaculty.teaching_experience && (
                      <div className='text-sm'>
                        <span className='font-medium'>
                          Teaching Experience:
                        </span>
                        <p className='text-muted-foreground'>
                          {selectedFaculty.teaching_experience} years
                        </p>
                      </div>
                    )}
                    {selectedFaculty.publications && (
                      <div className='text-sm'>
                        <span className='font-medium'>Publications:</span>
                        <p className='text-muted-foreground'>
                          {selectedFaculty.publications} papers
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Bio Section */}
              {selectedFaculty.bio && (
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <BookOpen className='h-5 w-5' />
                      About
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {selectedFaculty.bio}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Research Areas */}
              {selectedFaculty.research_areas &&
                selectedFaculty.research_areas.length > 0 && (
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <Award className='h-5 w-5' />
                        Research Areas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-2'>
                        {selectedFaculty.research_areas.map((area, index) => (
                          <span
                            key={index}
                            className='px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full'
                          >
                            {area}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Teaching Information */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {selectedFaculty.subjects &&
                  selectedFaculty.subjects.length > 0 && (
                    <Card>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-lg flex items-center gap-2'>
                          <BookOpen className='h-5 w-5' />
                          Subjects
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='flex flex-wrap gap-2'>
                          {selectedFaculty.subjects.map((subject, index) => (
                            <span
                              key={index}
                              className='px-2 py-1 bg-green-100 text-green-800 text-sm rounded'
                            >
                              {subject}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {selectedFaculty.sections &&
                  selectedFaculty.sections.length > 0 && (
                    <Card>
                      <CardHeader className='pb-3'>
                        <CardTitle className='text-lg flex items-center gap-2'>
                          <Users className='h-5 w-5' />
                          Sections
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className='flex flex-wrap gap-2'>
                          {selectedFaculty.sections.map((section, index) => (
                            <span
                              key={index}
                              className='px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded'
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>

              {/* Awards and Achievements */}
              {selectedFaculty.awards && selectedFaculty.awards.length > 0 && (
                <Card>
                  <CardHeader className='pb-3'>
                    <CardTitle className='text-lg flex items-center gap-2'>
                      <Trophy className='h-5 w-5' />
                      Awards & Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-2'>
                      {selectedFaculty.awards.map((award, index) => (
                        <li
                          key={index}
                          className='flex items-center gap-2 text-sm'
                        >
                          <Star className='h-4 w-4 text-yellow-500' />
                          {award}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Certifications */}
              {selectedFaculty.certifications &&
                selectedFaculty.certifications.length > 0 && (
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <FileText className='h-5 w-5' />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-2'>
                        {selectedFaculty.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className='px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full'
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Languages */}
              {selectedFaculty.languages &&
                selectedFaculty.languages.length > 0 && (
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <Languages className='h-5 w-5' />
                        Languages
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-2'>
                        {selectedFaculty.languages.map((language, index) => (
                          <span
                            key={index}
                            className='px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded'
                          >
                            {language}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Social Links */}
              {selectedFaculty.social_links &&
                Object.values(selectedFaculty.social_links).some(
                  link => link
                ) && (
                  <Card>
                    <CardHeader className='pb-3'>
                      <CardTitle className='text-lg flex items-center gap-2'>
                        <Globe className='h-5 w-5' />
                        Social Profiles
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className='flex flex-wrap gap-3'>
                        {selectedFaculty.social_links.linkedin && (
                          <a
                            href={selectedFaculty.social_links.linkedin}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm'
                          >
                            <ExternalLink className='h-4 w-4' />
                            LinkedIn
                          </a>
                        )}
                        {selectedFaculty.social_links.google_scholar && (
                          <a
                            href={selectedFaculty.social_links.google_scholar}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm'
                          >
                            <ExternalLink className='h-4 w-4' />
                            Google Scholar
                          </a>
                        )}
                        {selectedFaculty.social_links.research_gate && (
                          <a
                            href={selectedFaculty.social_links.research_gate}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm'
                          >
                            <ExternalLink className='h-4 w-4' />
                            ResearchGate
                          </a>
                        )}
                        {selectedFaculty.social_links.orcid && (
                          <a
                            href={selectedFaculty.social_links.orcid}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm'
                          >
                            <ExternalLink className='h-4 w-4' />
                            ORCID
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

              {/* Action Buttons */}
              <div className='flex justify-end gap-3 pt-4 border-t'>
                <Button variant='outline' onClick={() => setProfileOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setProfileOpen(false);
                    onMessage(selectedFaculty.id);
                  }}
                >
                  <MessageCircle className='h-4 w-4 mr-2' />
                  Start Chat
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
