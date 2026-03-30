import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, LogOut, UserCircle, Shield, Bell } from 'lucide-react';

const ProfileDropdown = () => {
  const { signOut } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
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
  };

  if (!profile) return null;

  // Get avatar from localStorage overrides or use default
  const getAvatarUrl = () => {
    if (typeof window !== 'undefined') {
      try {
        const overrides = JSON.parse(
          localStorage.getItem('profile_overrides_v1') || '{}'
        );
        return overrides?.avatarDataUrl || '';
      } catch {
        return '';
      }
    }
    return '';
  };

  const getInitials = () => {
    return (
      profile.full_name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U'
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='relative h-10 w-10 rounded-full p-0 hover:bg-gray-100 transition-colors'
        >
          <Avatar className='h-10 w-10'>
            <AvatarImage
              src={getAvatarUrl()}
              alt={profile.full_name || 'User'}
            />
            <AvatarFallback className='bg-primary/10 text-primary font-semibold'>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className='w-64' align='end' forceMount>
        <DropdownMenuLabel className='font-normal'>
          <div className='flex flex-col space-y-1'>
            <p className='text-sm font-medium leading-none'>
              {profile.full_name || 'User'}
            </p>
            <p className='text-xs leading-none text-muted-foreground'>
              {profile.email}
            </p>
            <div className='flex items-center gap-1 mt-1'>
              <span className='text-xs text-muted-foreground capitalize'>
                {profile.role}
              </span>
              {profile.role === 'faculty' && (
                <Shield className='h-3 w-3 text-blue-500' />
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link
            to='/profile'
            className='flex items-center gap-2 cursor-pointer'
          >
            <UserCircle className='h-4 w-4' />
            <span>View Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to='/profile'
            className='flex items-center gap-2 cursor-pointer'
          >
            <User className='h-4 w-4' />
            <span>Edit Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to='/settings'
            className='flex items-center gap-2 cursor-pointer'
          >
            <Settings className='h-4 w-4' />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        {profile.role === 'student' && (
          <DropdownMenuItem asChild>
            <Link
              to='/notifications'
              className='flex items-center gap-2 cursor-pointer'
            >
              <Bell className='h-4 w-4' />
              <span>Notifications</span>
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleSignOut}
          className='flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50'
        >
          <LogOut className='h-4 w-4' />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
