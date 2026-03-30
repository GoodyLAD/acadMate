import type { PlatformKey } from './types';

export const PLATFORMS: {
  key: PlatformKey;
  label: string;
  icon: string;
  helper: string;
  pattern?: RegExp;
}[] = [
  {
    key: 'leetcode',
    label: 'LeetCode',
    icon: '🟧',
    helper:
      'Username or profile URL, e.g., leetmeup or https://leetcode.com/leetmeup',
    pattern:
      /^(https?:\/\/leetcode\.com\/u\/|https?:\/\/leetcode\.com\/)?[A-Za-z0-9_-]{1,30}\/?$/i,
  },
  {
    key: 'codeforces',
    label: 'Codeforces',
    icon: '🟦',
    helper:
      'Handle or URL, e.g., tourist or https://codeforces.com/profile/tourist',
    pattern:
      /^(https?:\/\/codeforces\.com\/profile\/)?[A-Za-z0-9_-]{1,40}\/?$/i,
  },
  {
    key: 'hackerrank',
    label: 'HackerRank',
    icon: '🟩',
    helper:
      'Username or URL, e.g., hr_user or https://www.hackerrank.com/hr_user',
    pattern: /^(https?:\/\/(www\.)?hackerrank\.com\/)?[A-Za-z0-9_-]{1,40}\/?$/i,
  },
  {
    key: 'gfg',
    label: 'GeeksforGeeks',
    icon: '🟢',
    helper:
      'Profile URL or handle, e.g., https://auth.geeksforgeeks.org/user/foo or foo',
    pattern:
      /^(https?:\/\/auth\.geeksforgeeks\.org\/user\/)?[A-Za-z0-9._-]{1,60}\/?$/i,
  },
  {
    key: 'spoj',
    label: 'Spoj',
    icon: '⚪',
    helper:
      'Username or URL, e.g., johnny or https://www.spoj.com/users/johnny',
    pattern:
      /^(https?:\/\/(www\.)?spoj\.com\/users\/)?[A-Za-z0-9_-]{1,40}\/?$/i,
  },
  {
    key: 'custom',
    label: 'Custom',
    icon: '🎛️',
    helper: 'Any URL or identifier. No validation applied.',
  },
];

export const defaultSuggestions = [
  'Solve 50 LeetCode problems',
  'Finish 20 Codeforces problems',
  'Practice 10 HackerRank challenges',
  'Solve 30 GFG problems',
  'Compete in 3 Codeforces contests',
];
