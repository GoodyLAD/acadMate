import React from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User } from 'lucide-react';
import NotificationBell from '../NotificationBell';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get profile picture from localStorage
  const getProfilePicture = () => {
    if (typeof window === 'undefined') return '';
    try {
      const overrides = JSON.parse(
        localStorage.getItem('profile_overrides_v1') || '{}'
      );
      return overrides.avatarDataUrl || '';
    } catch {
      return '';
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: 'Signed out successfully!',
        });
        navigate('/auth', { replace: true });
      }
    } catch (err) {
      console.error('Unexpected error during sign out:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during sign out',
        variant: 'destructive',
      });
    }
  };

  const location = useLocation();
  const tabsRef = React.useRef<HTMLDivElement | null>(null);
  const btnRefs = React.useRef<Record<string, HTMLElement | null>>({});
  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });
  const [focusedIndex, setFocusedIndex] = React.useState<number | null>(null);

  // ── Student-only routes ──────────────────────────────────────────────
  const studentItems = [
    { label: 'Home', to: '/home' },
    { label: 'Dashboard', to: '/' },
    { label: 'Community', to: '/community' },
    { label: 'Events', to: '/events' },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'My Courses', to: '/student-courses' },
  ];

  // ── Faculty-only routes ──────────────────────────────────────────────
  const facultyItems = [
    { label: 'Dashboard', to: '/' },
    { label: 'Courses', to: '/courses' },
    { label: 'Schedule', to: '/schedule' },
    { label: 'My Students', to: '/faculty/students' },
    { label: 'Faculty Community', to: '/faculty/community' },
    { label: 'Events', to: '/events' },
  ];

  // ── Admin-only routes ────────────────────────────────────────────────
  const adminItems = [
    { label: 'Admin Dashboard', to: '/admin' },
    { label: 'Faculty Mgmt', to: '/admin/faculty' },
    { label: 'Assignments', to: '/admin/assignments' },
    { label: 'LMS Integrations', to: '/admin/integrations' },
    { label: 'Reports', to: '/admin/reports' },
    { label: 'Debug', to: '/admin/debug' },
  ];

  const items = React.useMemo(() => {
    if (profile?.role === 'faculty' && profile?.faculty_level === 'admin') {
      return adminItems;
    }
    if (profile?.role === 'faculty') {
      return facultyItems;
    }
    if (profile?.role === 'student') {
      return studentItems;
    }
    // default / loading: show a minimal common set
    return [
      { label: 'Dashboard', to: '/' },
      { label: 'Events', to: '/events' },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Match active tab: exact for '/', prefix for everything else
  const isItemActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname === to || location.pathname.startsWith(to + '/');
  };

  React.useLayoutEffect(() => {
    const active = items.find(i => isItemActive(i.to));
    if (active) {
      const container = tabsRef.current;
      const btn = btnRefs.current[active.label];
      if (container && btn) {
        const cRect = container.getBoundingClientRect();
        const bRect = btn.getBoundingClientRect();
        setIndicator({ left: bRect.left - cRect.left, width: bRect.width });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, items]);

  // keyboard navigation for tabs
  const onTabsKeyDown = (e: React.KeyboardEvent) => {
    const currentPathIndex = items.findIndex(i => isItemActive(i.to));
    const current =
      focusedIndex ?? (currentPathIndex >= 0 ? currentPathIndex : 0);
    if (e.key === 'ArrowRight') {
      const next = Math.min(items.length - 1, current + 1);
      setFocusedIndex(next);
      btnRefs.current[items[next].label]?.focus();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      const prev = Math.max(0, current - 1);
      setFocusedIndex(prev);
      btnRefs.current[items[prev].label]?.focus();
      e.preventDefault();
    }
  };

  return (
    <nav className='sticky top-0 z-40 border-b bg-white shadow-sm transition-colors duration-300'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          <div className='flex items-center gap-3'>
            <Link
              to='/'
              className='text-lg font-semibold tracking-tight hover:opacity-80 transition-opacity'
            >
              mondly
            </Link>
          </div>

          <div
            ref={tabsRef}
            onKeyDown={onTabsKeyDown}
            tabIndex={0}
            aria-label='Main navigation'
            role='tablist'
            className='relative hidden md:flex items-center gap-1 bg-gray-100 rounded-full p-1'
          >
            <span
              aria-hidden='true'
              className='pointer-events-none absolute top-1 bottom-1 rounded-full bg-[#111827] shadow-sm transition-all duration-300 ease-out z-0'
              style={{ left: indicator.left, width: indicator.width }}
            />
            {items.map(item => {
              const isActive = isItemActive(item.to);
              return (
                <NavLink
                  key={item.label}
                  ref={el => (btnRefs.current[item.label] = el)}
                  to={item.to}
                  role='tab'
                  aria-selected={isActive}
                  tabIndex={-1}
                  className={`relative z-10 px-4 py-1.5 rounded-full text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring ${isActive ? 'text-white' : 'text-gray-700 hover:text-gray-900'}`}
                  style={isActive ? { color: 'white !important' } : {}}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          <div className='flex items-center gap-3'>
            {profile && <NotificationBell />}
            {profile && (
              <>
                {/* Desktop Profile */}
                <div className='hidden sm:flex items-center gap-3 text-sm text-gray-700 transition-colors'>
                  <Link
                    to='/profile'
                    className='flex items-center gap-3 hover:opacity-80 transition-opacity'
                  >
                    <Avatar className='h-8 w-8'>
                      <AvatarImage
                        src={getProfilePicture()}
                        alt={profile.full_name}
                      />
                      <AvatarFallback className='text-xs'>
                        {profile.full_name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                      <span className='font-medium'>{profile.full_name}</span>
                      <span className='text-xs capitalize text-gray-500'>
                        ({profile.role})
                      </span>
                    </div>
                  </Link>
                </div>

                {/* Mobile Profile Dropdown */}
                <div className='sm:hidden'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm' className='p-1'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage
                            src={getProfilePicture()}
                            alt={profile.full_name}
                          />
                          <AvatarFallback className='text-xs'>
                            {profile.full_name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-56'>
                      <div className='flex items-center gap-3 p-2'>
                        <Avatar className='h-10 w-10'>
                          <AvatarImage
                            src={getProfilePicture()}
                            alt={profile.full_name}
                          />
                          <AvatarFallback>
                            {profile.full_name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                          <span className='font-medium'>
                            {profile.full_name}
                          </span>
                          <span className='text-xs capitalize text-gray-500'>
                            ({profile.role})
                          </span>
                        </div>
                      </div>
                      <DropdownMenuItem asChild>
                        <Link to='/profile' className='w-full'>
                          <User className='h-4 w-4 mr-2' />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className='h-4 w-4 mr-2' />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            )}
            {profile && (
              <div className='hidden sm:block'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleSignOut}
                  className='transition-all duration-200 hover:-translate-y-0.5'
                >
                  <LogOut className='h-4 w-4 mr-2' />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
