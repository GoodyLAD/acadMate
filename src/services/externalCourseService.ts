export interface ExternalCourse {
  id: string;
  title: string;
  provider: string;
  platform:
    | 'coursera'
    | 'linkedin'
    | 'udemy'
    | 'edx'
    | 'pluralsight'
    | 'khan_academy'
    | 'freecodecamp'
    | 'youtube'
    | 'other';
  url: string;
  description: string;
  duration_hours: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  price: number; // 0 for free courses
  language: string;
  skills: string[];
  categories: string[];
  instructor: string;
  thumbnail_url?: string;
  is_free: boolean;
  certificate_available: boolean;
  last_updated: string;
  popularity_score: number;
}

export interface ExternalCourseProvider {
  name: string;
  platform: string;
  api_endpoint?: string;
  api_key?: string;
  rate_limit: number; // requests per minute
  last_sync: string;
  total_courses: number;
}

class ExternalCourseService {
  private providers: ExternalCourseProvider[] = [
    {
      name: 'Coursera',
      platform: 'coursera',
      rate_limit: 100,
      last_sync: '',
      total_courses: 0,
    },
    {
      name: 'LinkedIn Learning',
      platform: 'linkedin',
      rate_limit: 200,
      last_sync: '',
      total_courses: 0,
    },
    {
      name: 'Udemy',
      platform: 'udemy',
      rate_limit: 50,
      last_sync: '',
      total_courses: 0,
    },
    {
      name: 'edX',
      platform: 'edx',
      rate_limit: 100,
      last_sync: '',
      total_courses: 0,
    },
    {
      name: 'Pluralsight',
      platform: 'pluralsight',
      rate_limit: 100,
      last_sync: '',
      total_courses: 0,
    },
    {
      name: 'Khan Academy',
      platform: 'khan_academy',
      rate_limit: 200,
      last_sync: '',
      total_courses: 0,
    },
    {
      name: 'freeCodeCamp',
      platform: 'freecodecamp',
      rate_limit: 100,
      last_sync: '',
      total_courses: 0,
    },
    {
      name: 'YouTube',
      platform: 'youtube',
      rate_limit: 1000,
      last_sync: '',
      total_courses: 0,
    },
  ];

  /**
   * Fetch courses from external platforms
   */
  async fetchExternalCourses(
    query: string,
    limit: number = 20
  ): Promise<ExternalCourse[]> {
    // For demo purposes, we'll create sample external courses
    // In production, you would integrate with actual APIs
    const sampleCourses = this.generateSampleExternalCourses(query, limit);

    return sampleCourses;
  }

  /**
   * Search courses across all external platforms
   */
  async searchCourses(
    query: string,
    filters: {
      platforms?: string[];
      difficulty?: string[];
      price_range?: 'free' | 'paid' | 'all';
      duration_min?: number;
      duration_max?: number;
      rating_min?: number;
    } = {},
    limit: number = 20
  ): Promise<ExternalCourse[]> {
    try {
      // In production, this would make API calls to external platforms
      const allCourses = await this.fetchExternalCourses(query, limit * 2);

      let filteredCourses = allCourses;

      // Apply filters
      if (filters.platforms && filters.platforms.length > 0) {
        filteredCourses = filteredCourses.filter(course =>
          filters.platforms!.includes(course.platform)
        );
      }

      if (filters.difficulty && filters.difficulty.length > 0) {
        filteredCourses = filteredCourses.filter(course =>
          filters.difficulty!.includes(course.difficulty_level)
        );
      }

      if (filters.price_range) {
        if (filters.price_range === 'free') {
          filteredCourses = filteredCourses.filter(course => course.is_free);
        } else if (filters.price_range === 'paid') {
          filteredCourses = filteredCourses.filter(course => !course.is_free);
        }
      }

      if (filters.duration_min) {
        filteredCourses = filteredCourses.filter(
          course => course.duration_hours >= filters.duration_min!
        );
      }

      if (filters.duration_max) {
        filteredCourses = filteredCourses.filter(
          course => course.duration_hours <= filters.duration_max!
        );
      }

      if (filters.rating_min) {
        filteredCourses = filteredCourses.filter(
          course => course.rating >= filters.rating_min!
        );
      }

      return filteredCourses.slice(0, limit);
    } catch (error) {
      console.error('Error searching external courses:', error);
      return [];
    }
  }

  /**
   * Get course recommendations from external platforms
   */
  async getExternalRecommendations(
    studentProfile: {
      interests: string[];
      skills: string[];
      career_goals: string[];
      experience_level: string;
    },
    limit: number = 10
  ): Promise<ExternalCourse[]> {
    try {
      // Create search query based on student profile
      const searchTerms = [
        ...studentProfile.interests,
        ...studentProfile.skills,
        ...studentProfile.career_goals,
      ].join(' ');

      const courses = await this.searchCourses(
        searchTerms,
        {
          difficulty: [studentProfile.experience_level],
          rating_min: 4.0,
        },
        limit
      );

      // Sort by relevance score
      return courses.sort((a, b) => b.popularity_score - a.popularity_score);
    } catch (error) {
      console.error('Error getting external recommendations:', error);
      return [];
    }
  }

  /**
   * Generate sample external courses for demo purposes
   */
  private generateSampleExternalCourses(
    query: string,
    limit: number
  ): ExternalCourse[] {
    const sampleCourses: ExternalCourse[] = [
      {
        id: 'coursera-1',
        title: 'Machine Learning by Stanford University',
        provider: 'Coursera',
        platform: 'coursera',
        url: 'https://www.coursera.org/learn/machine-learning',
        description:
          'Comprehensive introduction to machine learning algorithms and applications',
        duration_hours: 55,
        difficulty_level: 'intermediate',
        rating: 4.8,
        price: 49,
        language: 'English',
        skills: ['machine learning', 'python', 'statistics', 'data science'],
        categories: ['data science', 'artificial intelligence'],
        instructor: 'Andrew Ng',
        thumbnail_url:
          'https://images.unsplash.com/photo-1551288049-beb63bc8e69f?w=400&h=225&fit=crop&q=80',
        is_free: false,
        certificate_available: true,
        last_updated: '2024-01-15',
        popularity_score: 95,
      },
      {
        id: 'linkedin-1',
        title: 'JavaScript Essential Training',
        provider: 'LinkedIn Learning',
        platform: 'linkedin',
        url: 'https://www.linkedin.com/learning/javascript-essential-training',
        description: 'Master JavaScript fundamentals and modern ES6+ features',
        duration_hours: 6,
        difficulty_level: 'beginner',
        rating: 4.6,
        price: 29.99,
        language: 'English',
        skills: ['javascript', 'es6', 'dom manipulation', 'async programming'],
        categories: ['web development', 'programming'],
        instructor: 'Morten Rand-Hendriksen',
        thumbnail_url:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop&q=80',
        is_free: false,
        certificate_available: true,
        last_updated: '2024-01-10',
        popularity_score: 88,
      },
      {
        id: 'udemy-1',
        title: 'Complete React Developer Course',
        provider: 'Udemy',
        platform: 'udemy',
        url: 'https://www.udemy.com/course/complete-react-developer-course',
        description:
          'Build modern web applications with React, Redux, and React Router',
        duration_hours: 40,
        difficulty_level: 'intermediate',
        rating: 4.7,
        price: 89.99,
        language: 'English',
        skills: ['react', 'redux', 'javascript', 'jsx', 'hooks'],
        categories: ['web development', 'frontend'],
        instructor: 'Andrei Neagoie',
        thumbnail_url:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop&q=80',
        is_free: false,
        certificate_available: true,
        last_updated: '2024-01-12',
        popularity_score: 92,
      },
      {
        id: 'edx-1',
        title: 'Introduction to Computer Science',
        provider: 'edX',
        platform: 'edx',
        url: 'https://www.edx.org/course/introduction-computer-science-mitx-6-00-1x-0',
        description: "MIT's introduction to computer science and programming",
        duration_hours: 100,
        difficulty_level: 'beginner',
        rating: 4.9,
        price: 0,
        language: 'English',
        skills: ['python', 'algorithms', 'data structures', 'computer science'],
        categories: ['computer science', 'programming'],
        instructor: 'MIT Faculty',
        thumbnail_url:
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=225&fit=crop&q=80',
        is_free: true,
        certificate_available: true,
        last_updated: '2024-01-08',
        popularity_score: 98,
      },
      {
        id: 'freecodecamp-1',
        title: 'Responsive Web Design',
        provider: 'freeCodeCamp',
        platform: 'freecodecamp',
        url: 'https://www.freecodecamp.org/learn/responsive-web-design',
        description: 'Learn HTML, CSS, and responsive design principles',
        duration_hours: 300,
        difficulty_level: 'beginner',
        rating: 4.8,
        price: 0,
        language: 'English',
        skills: ['html', 'css', 'responsive design', 'flexbox', 'grid'],
        categories: ['web development', 'frontend'],
        instructor: 'freeCodeCamp',
        thumbnail_url:
          'https://images.unsplash.com/photo-1551288049-beb63bc8e69f?w=400&h=225&fit=crop&q=80',
        is_free: true,
        certificate_available: true,
        last_updated: '2024-01-05',
        popularity_score: 94,
      },
      {
        id: 'youtube-1',
        title: 'Python for Data Science - Complete Course',
        provider: 'YouTube',
        platform: 'youtube',
        url: 'https://www.youtube.com/watch?v=example',
        description:
          'Complete Python course for data science and machine learning',
        duration_hours: 12,
        difficulty_level: 'intermediate',
        rating: 4.5,
        price: 0,
        language: 'English',
        skills: ['python', 'pandas', 'numpy', 'matplotlib', 'data analysis'],
        categories: ['data science', 'python'],
        instructor: 'Data Science Dojo',
        thumbnail_url:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop&q=80',
        is_free: true,
        certificate_available: false,
        last_updated: '2024-01-03',
        popularity_score: 85,
      },
      {
        id: 'pluralsight-1',
        title: 'AWS Cloud Practitioner Essentials',
        provider: 'Pluralsight',
        platform: 'pluralsight',
        url: 'https://www.pluralsight.com/courses/aws-cloud-practitioner-essentials',
        description: 'Prepare for AWS Cloud Practitioner certification',
        duration_hours: 8,
        difficulty_level: 'beginner',
        rating: 4.6,
        price: 29.99,
        language: 'English',
        skills: ['aws', 'cloud computing', 'ec2', 's3', 'cloud architecture'],
        categories: ['cloud computing', 'aws'],
        instructor: 'Ryan Kroonenburg',
        thumbnail_url:
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=225&fit=crop&q=80',
        is_free: false,
        certificate_available: true,
        last_updated: '2024-01-07',
        popularity_score: 89,
      },
      {
        id: 'khan-1',
        title: 'Computer Programming',
        provider: 'Khan Academy',
        platform: 'khan_academy',
        url: 'https://www.khanacademy.org/computing/computer-programming',
        description:
          'Learn programming fundamentals with interactive exercises',
        duration_hours: 20,
        difficulty_level: 'beginner',
        rating: 4.7,
        price: 0,
        language: 'English',
        skills: ['javascript', 'html', 'css', 'programming basics'],
        categories: ['programming', 'web development'],
        instructor: 'Khan Academy',
        thumbnail_url:
          'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=225&fit=crop&q=80',
        is_free: true,
        certificate_available: false,
        last_updated: '2024-01-01',
        popularity_score: 91,
      },
    ];

    // Filter courses based on query
    const filteredCourses =
      query.trim() === ''
        ? sampleCourses
        : sampleCourses.filter(
            course =>
              course.title.toLowerCase().includes(query.toLowerCase()) ||
              course.description.toLowerCase().includes(query.toLowerCase()) ||
              course.skills.some(skill =>
                skill.toLowerCase().includes(query.toLowerCase())
              ) ||
              course.categories.some(category =>
                category.toLowerCase().includes(query.toLowerCase())
              )
          );

    return filteredCourses.slice(0, limit);
  }

  /**
   * Get available platforms
   */
  getProviders(): ExternalCourseProvider[] {
    return this.providers;
  }

  /**
   * Get course by ID
   */
  async getCourseById(courseId: string): Promise<ExternalCourse | null> {
    try {
      // In production, this would fetch from database or external API
      const courses = await this.fetchExternalCourses('', 100);
      return courses.find(course => course.id === courseId) || null;
    } catch (error) {
      console.error('Error getting course by ID:', error);
      return null;
    }
  }

  /**
   * Track course enrollment (for analytics)
   */
  async trackEnrollment(): Promise<boolean> {
    try {
      // In production, this would store in database
      return true;
    } catch (error) {
      console.error('Error tracking enrollment:', error);
      return false;
    }
  }
}

export const externalCourseService = new ExternalCourseService();
