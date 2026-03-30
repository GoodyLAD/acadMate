// Avatar Utility Functions
// Handles consistent avatar URL generation and fallbacks

export interface AvatarOptions {
  name?: string;
  role?: 'student' | 'faculty' | 'admin';
  email?: string;
  size?: number;
  style?: 'avataaars' | 'personas' | 'micah' | 'adventurer';
}

/**
 * Generate a consistent avatar URL using DiceBear API
 */
export function generateAvatarUrl(options: AvatarOptions): string {
  const { name = 'User', role = 'student', size = 200, style } = options;

  // Determine style based on role if not specified
  const avatarStyle = style || (role === 'faculty' ? 'personas' : 'avataaars');

  // Create a seed from the name for consistency
  const seed = encodeURIComponent(name.trim());

  return `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${seed}&size=${size}`;
}

/**
 * Get avatar URL with proper fallbacks
 */
export function getAvatarUrl(
  avatarUrl?: string | null,
  options?: AvatarOptions
): string {
  // If avatar_url exists and is not empty, use it
  if (avatarUrl && avatarUrl.trim() !== '') {
    return avatarUrl;
  }

  // Generate a default avatar
  if (options) {
    return generateAvatarUrl(options);
  }

  // Fallback to a generic avatar
  return 'https://api.dicebear.com/7.x/avataaars/svg?seed=default&size=200';
}

/**
 * Get avatar URL for a profile object
 */
export function getProfileAvatarUrl(profile: {
  avatar_url?: string | null;
  full_name?: string;
  role?: string;
  email?: string;
}): string {
  return getAvatarUrl(profile.avatar_url, {
    name: profile.full_name || 'User',
    role: profile.role as 'student' | 'faculty' | 'admin',
    email: profile.email,
  });
}

/**
 * Get avatar URL from localStorage overrides
 */
export function getLocalStorageAvatar(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const overrides = JSON.parse(
      localStorage.getItem('profile_overrides_v1') || '{}'
    );
    return overrides.avatarDataUrl || null;
  } catch {
    return null;
  }
}

/**
 * Get avatar URL with localStorage override support
 */
export function getAvatarWithOverride(
  avatarUrl?: string | null,
  options?: AvatarOptions
): string {
  // Check localStorage override first
  const localOverride = getLocalStorageAvatar();
  if (localOverride) {
    return localOverride;
  }

  // Use regular avatar logic
  return getAvatarUrl(avatarUrl, options);
}

/**
 * Avatar component props helper
 */
export function getAvatarProps(profile: {
  avatar_url?: string | null;
  full_name?: string;
  role?: string;
  email?: string;
}) {
  const avatarUrl = getProfileAvatarUrl(profile);
  const fallbackText = (profile.full_name || 'U').slice(0, 1).toUpperCase();

  return {
    src: avatarUrl,
    alt: profile.full_name || 'User',
    fallback: fallbackText,
  };
}

/**
 * Check if an avatar URL is valid
 */
export function isValidAvatarUrl(url: string): boolean {
  if (!url || url.trim() === '') return false;

  // Check if it's a data URL
  if (url.startsWith('data:')) return true;

  // Check if it's a valid HTTP/HTTPS URL
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate multiple avatar sizes for different use cases
 */
export function generateAvatarSizes(name: string, role: string = 'student') {
  const baseUrl = generateAvatarUrl({ name, role });

  return {
    small: baseUrl.replace('size=200', 'size=40'),
    medium: baseUrl.replace('size=200', 'size=80'),
    large: baseUrl.replace('size=200', 'size=120'),
    xlarge: baseUrl.replace('size=200', 'size=200'),
  };
}
