export interface PlatformData {
  solved: number;
  hours: number;
  courses: number;
  contests?: number;
  rating?: number;
  // Additional platform-specific data
  [key: string]: any;
}

// Env-configurable proxy base for platforms that require server-side fetching
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PLATFORM_API_BASE: string =
  (import.meta as any)?.env?.VITE_PLATFORM_API_BASE || '';

// Optional API keys (if your proxy expects them)
const API_KEY: string | undefined = (import.meta as any)?.env
  ?.VITE_PLATFORM_API_KEY;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GFG_KEY: string | undefined = (import.meta as any)?.env?.VITE_GFG_API_KEY;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HACKERRANK_KEY: string | undefined = (import.meta as any)?.env
  ?.VITE_HACKERRANK_API_KEY;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HACKEREARTH_KEY: string | undefined = (import.meta as any)?.env
  ?.VITE_HACKEREARTH_API_KEY;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CODECHEF_KEY: string | undefined = (import.meta as any)?.env
  ?.VITE_CODECHEF_API_KEY;

// Simple CORS bypass services

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildHeaders(extra?: Record<string, string>) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (API_KEY) headers['x-api-key'] = API_KEY;
  if (extra) Object.assign(headers, extra);
  return headers;
}

// Simple and effective CORS bypass function
async function scrapeProfile(url: string): Promise<string | null> {
  const proxies = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://api.codetabs.com/v1/proxy?quest=',
    'https://thingproxy.freeboard.io/fetch/',
  ];

  for (const proxy of proxies) {
    try {
      const response = await fetch(`${proxy}${encodeURIComponent(url)}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      if (response.ok) {
        const html = await response.text();
        if (html && html.length > 100) {
          return html;
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      continue;
    }
  }
  return null;
}

// Simple platform-specific data fetching
async function fetchPlatformData(
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  platform: string
): Promise<string | null> {
  // Try scraping with simple approach
  const html = await scrapeProfile(url);
  if (html) {
    return html;
  }
  return null;
}

/**
 * ✅ LeetCode - GraphQL/ Unofficial API Alternative
 * Uses multiple unofficial APIs for better reliability
 */
export async function fetchLeetCodeData(
  studentId: string
): Promise<PlatformData> {
  try {
    // Try multiple unofficial APIs for better reliability
    const apis = [
      `https://leetcode-stats-api.herokuapp.com/${studentId}`,
      `https://leetcode-api.vercel.app/${studentId}`,
      `https://leetcode-api.cyclic.app/${studentId}`,
    ];

    for (const apiUrl of apis) {
      try {
        const res = await fetch(apiUrl);
        if (res.ok) {
          const json = await res.json();

          if (json.status === 'error' || json.status === 'failed') {
            continue; // Try next API
          }

          const solved = json.totalSolved || json.solved || 0;
          const contests = json.totalContests || json.contests || 0;
          const rating = json.contestRating || json.rating || 0;
          const easySolved = json.easySolved || 0;
          const mediumSolved = json.mediumSolved || 0;
          const hardSolved = json.hardSolved || 0;

          // Calculate estimated hours based on problem difficulty
          const estimatedHours = Math.floor(
            easySolved * 0.5 + mediumSolved * 1.5 + hardSolved * 3
          );

          return {
            solved,
            hours: Math.max(estimatedHours, Math.floor(solved / 10)),
            courses: 0,
            contests,
            rating,
            // Additional LeetCode-specific data
            easySolved,
            mediumSolved,
            hardSolved,
            acceptanceRate: json.acceptanceRate || 0,
            ranking: json.ranking || 0,
            platform: 'leetcode',
          };
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (apiError) {
        continue;
      }
    }

    // If all APIs fail, try scraping as last resort
    try {
      const html = await scrapeProfile(`https://leetcode.com/${studentId}/`);
      if (html) {
        // Parse HTML to extract data (basic scraping)
        const solvedMatch = html.match(/Solved[^>]*>(\d+)/i);
        const ratingMatch = html.match(/Contest Rating[^>]*>(\d+)/i);

        const solved = solvedMatch ? parseInt(solvedMatch[1]) : 0;
        const rating = ratingMatch ? parseInt(ratingMatch[1]) : 0;

        return {
          solved,
          hours: Math.floor(solved * 1.0), // Average 1 hour per problem
          courses: 0,
          contests: 0,
          rating,
          platform: 'leetcode',
        };
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (scrapingError) { /* ignore */ }

    console.warn(`All LeetCode APIs failed for user ${studentId}`);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  } catch (err) {
    console.error('Network error fetching LeetCode data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

/**
 * ✅ Enhanced Codeforces API integration with comprehensive data
 * Fetches user status, info, and contest participation
 */
export async function fetchCodeforcesData(
  studentId: string
): Promise<PlatformData> {
  try {
    // Fetch user submissions and info in parallel
    const [submissionsRes, userRes] = await Promise.all([
      fetch(`https://codeforces.com/api/user.status?handle=${studentId}`),
      fetch(`https://codeforces.com/api/user.info?handles=${studentId}`),
    ]);

    if (!submissionsRes.ok) {
      console.error(
        'Codeforces submissions API responded with',
        submissionsRes.status
      );
      return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
    }

    const submissionsJson = await submissionsRes.json();
    if (submissionsJson.status !== 'OK') {
      console.warn(`Codeforces user ${studentId} not found or private profile`);
      return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
    }

    // Count unique accepted problems
    const solved = new Set(
      submissionsJson.result
        .filter((s: any) => s.verdict === 'OK')
        .map((s: any) => s.problem.name)
    ).size;

    // Count contests participated
    const contestsParticipated = new Set(
      submissionsJson.result
        .filter((s: any) => s.verdict === 'OK' && s.contestId)
        .map((s: any) => s.contestId)
    ).size;

    // Get user info for rating and additional data
    let rating = 0;
    let maxRating = 0;
    let rank = '';
    if (userRes.ok) {
      const userJson = await userRes.json();
      if (userJson.status === 'OK' && userJson.result?.[0]) {
        const userInfo = userJson.result[0];
        rating = userInfo.rating || 0;
        maxRating = userInfo.maxRating || 0;
        rank = userInfo.rank || '';
      }
    }

    // Calculate estimated hours based on problem difficulty
    const solvedProblems = submissionsJson.result.filter(
      (s: any) => s.verdict === 'OK'
    );
    const estimatedHours = Math.floor(solvedProblems.length * 0.5); // Average 30 min per problem

    return {
      solved,
      hours: Math.max(estimatedHours, Math.floor(solved / 5)),
      courses: 0,
      contests: contestsParticipated,
      rating,
      // Additional Codeforces-specific data
      maxRating,
      rank,
      totalSubmissions: submissionsJson.result.length,
      acceptedSubmissions: solvedProblems.length,
    };
  } catch (err) {
    console.error('Network error fetching Codeforces data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

/**
 * ✅ Enhanced Codewars API integration with comprehensive data
 * Fetches detailed user statistics and achievements
 */
export async function fetchCodewarsData(
  studentId: string
): Promise<PlatformData> {
  try {
    const res = await fetch(
      `https://www.codewars.com/api/v1/users/${studentId}`
    );
    if (!res.ok) {
      console.error('Codewars API responded with', res.status);
      return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
    }
    const json = await res.json();

    if (json.success === false || json.name === undefined) {
      console.warn(`Codewars user ${studentId} not found`);
      return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
    }

    const solved = json.codeChallenges?.totalCompleted || 0;
    const honor = json.honor || 0;
    const rank = json.ranks?.overall?.rank || 0;
    const score = json.ranks?.overall?.score || 0;
    const languages = Object.keys(json.ranks?.languages || {});
    const totalCompleted = json.codeChallenges?.totalCompleted || 0;
    const totalAuthored = json.codeChallenges?.totalAuthored || 0;

    // Calculate estimated hours based on kata difficulty and completion
    const estimatedHours = Math.floor(solved * 1.5); // Average 1.5 hours per kata

    return {
      solved,
      hours: Math.max(estimatedHours, Math.floor(solved / 8)),
      courses: 0,
      contests: 0,
      rating: Math.floor(honor / 100), // Convert honor to a rating-like number
      // Additional Codewars-specific data
      honor,
      rank,
      score,
      languages: languages.length,
      totalAuthored,
      totalCompleted,
      leaderboardPosition: json.leaderboardPosition || 0,
    };
  } catch (err) {
    console.error('Network error fetching Codewars data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

/**
 * ✅ GFG (GeeksforGeeks) - Enhanced Scraping Strategy
 * Since GFG has no official API, we use improved scraping with multiple patterns
 */
export async function fetchGFGData(studentId: string): Promise<PlatformData> {
  try {
    // Try scraping with multiple URL patterns
    const urls = [
      `https://www.geeksforgeeks.org/user/${studentId}/`,
      `https://www.geeksforgeeks.org/user/${studentId}`,
    ];

    for (const url of urls) {
      try {
        const html = await fetchPlatformData(url, 'gfg');
        if (html) {
          // Enhanced parsing with multiple patterns
          const patterns = {
            solved: [
              /Problems Solved[^>]*>(\d+)/i,
              /problems solved[^>]*>(\d+)/i,
              /solved.*?(\d+)/i,
              /"problems_solved":\s*(\d+)/i,
              /problems.*?(\d+)/i,
            ],
            codingScore: [
              /Overall Coding Score[^>]*>(\d+)/i,
              /coding score[^>]*>(\d+)/i,
              /"coding_score":\s*(\d+)/i,
              /score.*?(\d+)/i,
            ],
            institute: [
              /Institute[^>]*>([^<]+)/i,
              /institution[^>]*>([^<]+)/i,
              /college[^>]*>([^<]+)/i,
              /"institute":\s*"([^"]+)"/i,
            ],
          };

          let solved = 0;
          let codingScore = 0;
          let institute = '';

          // Try all patterns for each field
          for (const pattern of patterns.solved) {
            const match = html.match(pattern);
            if (match) {
              solved = parseInt(match[1]);
              break;
            }
          }

          for (const pattern of patterns.codingScore) {
            const match = html.match(pattern);
            if (match) {
              codingScore = parseInt(match[1]);
              break;
            }
          }

          for (const pattern of patterns.institute) {
            const match = html.match(pattern);
            if (match) {
              institute = match[1].trim();
              break;
            }
          }
          if (solved > 0) {
            // Only return if we got valid data
            return {
              solved,
              hours: Math.floor(solved * 0.75), // Average 45 min per problem
              courses: 0,
              contests: 0, // GFG doesn't have clear contest data
              rating: Math.floor(codingScore / 100), // Convert score to rating
              // Additional GFG-specific data
              institute,
              codingScore,
              platform: 'gfg',
            };
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (scrapingError) {
        continue;
      }
    }

    // No data available
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  } catch (err) {
    console.error('Error fetching GFG data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

/**
 * ✅ HackerRank - Enhanced Scraping Strategy
 * Since HackerRank has no public API, we use improved scraping with multiple patterns
 */
export async function fetchHackerRankData(
  studentId: string
): Promise<PlatformData> {
  try {
    // Try scraping with multiple URL patterns
    const urls = [
      `https://www.hackerrank.com/${studentId}`,
      `https://www.hackerrank.com/${studentId}/`,
      `https://hackerrank.com/${studentId}`,
      `https://hackerrank.com/${studentId}/`,
    ];

    for (const url of urls) {
      try {
        const html = await fetchPlatformData(url, 'hackerrank');
        if (html) {
          // Enhanced parsing with multiple patterns
          const patterns = {
            solved: [
              /Challenges Solved[^>]*>(\d+)/i,
              /challenges solved[^>]*>(\d+)/i,
              /solved.*?(\d+)/i,
              /"challenges_solved":\s*(\d+)/i,
              /problems.*?(\d+)/i,
              /total.*?(\d+)/i,
            ],
            level: [
              /Level[^>]*>(\d+)/i,
              /level[^>]*>(\d+)/i,
              /"level":\s*(\d+)/i,
              /rank.*?(\d+)/i,
            ],
            country: [
              /Country[^>]*>([^<]+)/i,
              /country[^>]*>([^<]+)/i,
              /location[^>]*>([^<]+)/i,
              /"country":\s*"([^"]+)"/i,
            ],
            badges: [
              /badges[^>]*>(\d+)/i,
              /certificates[^>]*>(\d+)/i,
              /"badges":\s*(\d+)/i,
            ],
          };

          let solved = 0;
          let level = 0;
          let country = '';
          let badges = 0;

          // Try all patterns for each field
          for (const pattern of patterns.solved) {
            const match = html.match(pattern);
            if (match) {
              solved = parseInt(match[1]);
              break;
            }
          }

          for (const pattern of patterns.level) {
            const match = html.match(pattern);
            if (match) {
              level = parseInt(match[1]);
              break;
            }
          }

          for (const pattern of patterns.country) {
            const match = html.match(pattern);
            if (match) {
              country = match[1].trim();
              break;
            }
          }

          for (const pattern of patterns.badges) {
            const match = html.match(pattern);
            if (match) {
              badges = parseInt(match[1]);
              break;
            }
          }
          if (solved > 0) {
            // Only return if we got valid data
            return {
              solved,
              hours: Math.floor(solved * 1.2), // Average 1.2 hours per challenge
              courses: 0,
              contests: 0, // HackerRank doesn't have clear contest data
              rating: level * 100, // Convert level to rating
              // Additional HackerRank-specific data
              country,
              level,
              badges,
              platform: 'hackerrank',
            };
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (scrapingError) {
        continue;
      }
    }

    // No data available
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  } catch (err) {
    console.error('Error fetching HackerRank data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

/**
 * ✅ HackerEarth - Enhanced Scraping Strategy
 * Uses limited official API with improved scraping fallback
 */
export async function fetchHackerEarthData(
  studentId: string
): Promise<PlatformData> {
  try {
    // Try limited official API first
    try {
      const res = await fetch(
        `https://www.hackerearth.com/api/users/${studentId}/`,
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      );
      if (res.ok) {
        const json = await res.json();
        const solved = json.problems_solved || 0;
        const contests = json.contests_participated || 0;
        const rating = json.rating || 0;
        if (solved > 0) {
          // Only return if we got valid data
          return {
            solved,
            hours: Math.floor(solved * 1.0), // Average 1 hour per problem
            courses: 0,
            contests,
            rating,
            // Additional HackerEarth-specific data
            country: json.country || '',
            city: json.city || '',
            totalSubmissions: json.total_submissions || 0,
            accuracy: json.accuracy || 0,
            platform: 'hackerearth',
          };
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (apiError) { /* ignore */ }

    // Enhanced scraping with multiple URL patterns
    const urls = [
      `https://www.hackerearth.com/@${studentId}`,
      `https://www.hackerearth.com/@${studentId}/`,
      `https://hackerearth.com/@${studentId}`,
      `https://hackerearth.com/@${studentId}/`,
    ];

    for (const url of urls) {
      try {
        const html = await fetchPlatformData(url, 'hackerearth');
        if (html) {
          // Enhanced parsing with multiple patterns
          const patterns = {
            solved: [
              /Problems Solved[^>]*>(\d+)/i,
              /problems solved[^>]*>(\d+)/i,
              /solved.*?(\d+)/i,
              /"problems_solved":\s*(\d+)/i,
              /total.*?(\d+)/i,
            ],
            rating: [
              /Rating[^>]*>(\d+)/i,
              /rating[^>]*>(\d+)/i,
              /"rating":\s*(\d+)/i,
              /score.*?(\d+)/i,
            ],
            country: [
              /Country[^>]*>([^<]+)/i,
              /country[^>]*>([^<]+)/i,
              /location[^>]*>([^<]+)/i,
              /"country":\s*"([^"]+)"/i,
            ],
            contests: [
              /Contests[^>]*>(\d+)/i,
              /contests[^>]*>(\d+)/i,
              /"contests_participated":\s*(\d+)/i,
              /participated.*?(\d+)/i,
            ],
          };

          let solved = 0;
          let rating = 0;
          let country = '';
          let contests = 0;

          // Try all patterns for each field
          for (const pattern of patterns.solved) {
            const match = html.match(pattern);
            if (match) {
              solved = parseInt(match[1]);
              break;
            }
          }

          for (const pattern of patterns.rating) {
            const match = html.match(pattern);
            if (match) {
              rating = parseInt(match[1]);
              break;
            }
          }

          for (const pattern of patterns.country) {
            const match = html.match(pattern);
            if (match) {
              country = match[1].trim();
              break;
            }
          }

          for (const pattern of patterns.contests) {
            const match = html.match(pattern);
            if (match) {
              contests = parseInt(match[1]);
              break;
            }
          }
          if (solved > 0) {
            // Only return if we got valid data
            return {
              solved,
              hours: Math.floor(solved * 1.0), // Average 1 hour per problem
              courses: 0,
              contests,
              rating,
              // Additional HackerEarth-specific data
              country,
              platform: 'hackerearth',
            };
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (scrapingError) {
        continue;
      }
    }

    // No data available
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  } catch (err) {
    console.error('Error fetching HackerEarth data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

/**
 * ✅ CodeChef - Enhanced Scraping Strategy
 * Since CodeChef has no reliable public API, we use improved scraping with multiple patterns
 */
export async function fetchCodeChefData(
  studentId: string
): Promise<PlatformData> {
  try {
    // Try scraping with multiple URL patterns
    const urls = [
      `https://www.codechef.com/users/${studentId}`,
      `https://www.codechef.com/users/${studentId}/`,
      `https://codechef.com/users/${studentId}`,
      `https://codechef.com/users/${studentId}/`,
    ];

    for (const url of urls) {
      try {
        const html = await fetchPlatformData(url, 'codechef');
        if (html) {
          // Enhanced parsing with multiple patterns
          const patterns = {
            solved: [
              /Problems Solved[^>]*>(\d+)/i,
              /problems solved[^>]*>(\d+)/i,
              /solved.*?(\d+)/i,
              /"problems_solved":\s*(\d+)/i,
              /total.*?(\d+)/i,
              /practice.*?(\d+)/i,
            ],
            rating: [
              /Rating[^>]*>(\d+)/i,
              /rating[^>]*>(\d+)/i,
              /"rating":\s*(\d+)/i,
              /current.*?(\d+)/i,
              /overall.*?(\d+)/i,
            ],
            country: [
              /Country[^>]*>([^<]+)/i,
              /country[^>]*>([^<]+)/i,
              /location[^>]*>([^<]+)/i,
              /"country":\s*"([^"]+)"/i,
            ],
            institution: [
              /Institution[^>]*>([^<]+)/i,
              /institution[^>]*>([^<]+)/i,
              /college[^>]*>([^<]+)/i,
              /university[^>]*>([^<]+)/i,
              /"institution":\s*"([^"]+)"/i,
            ],
            division: [
              /Division[^>]*>([^<]+)/i,
              /division[^>]*>([^<]+)/i,
              /"division":\s*"([^"]+)"/i,
            ],
            contests: [
              /Contests[^>]*>(\d+)/i,
              /contests[^>]*>(\d+)/i,
              /"contests_participated":\s*(\d+)/i,
              /participated.*?(\d+)/i,
            ],
          };

          let solved = 0;
          let rating = 0;
          let country = '';
          let institution = '';
          let division = '';
          let contests = 0;

          // Try all patterns for each field
          for (const pattern of patterns.solved) {
            const match = html.match(pattern);
            if (match) {
              solved = parseInt(match[1]);
              break;
            }
          }

          for (const pattern of patterns.rating) {
            const match = html.match(pattern);
            if (match) {
              rating = parseInt(match[1]);
              break;
            }
          }

          for (const pattern of patterns.country) {
            const match = html.match(pattern);
            if (match) {
              country = match[1].trim();
              break;
            }
          }

          for (const pattern of patterns.institution) {
            const match = html.match(pattern);
            if (match) {
              institution = match[1].trim();
              break;
            }
          }

          for (const pattern of patterns.division) {
            const match = html.match(pattern);
            if (match) {
              division = match[1].trim();
              break;
            }
          }

          for (const pattern of patterns.contests) {
            const match = html.match(pattern);
            if (match) {
              contests = parseInt(match[1]);
              break;
            }
          }
          if (solved > 0) {
            // Only return if we got valid data
            return {
              solved,
              hours: Math.floor(solved * 0.8), // Average 48 min per problem
              courses: 0,
              contests,
              rating,
              // Additional CodeChef-specific data
              country,
              institution,
              division,
              platform: 'codechef',
            };
          }
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (scrapingError) {
        continue;
      }
    }

    // No data available
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  } catch (err) {
    console.error('Error fetching CodeChef data for', studentId, err);
    return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
  }
}

// placeholder
export async function fetchPlaceholderData(): Promise<PlatformData> {
  return { solved: 0, hours: 0, courses: 0, contests: 0, rating: 0 };
}
