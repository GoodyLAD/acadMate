import { supabase } from '@/integrations/supabase/client';

export interface StudentProfile {
  id: string;
  full_name: string;
  email: string;
  interests: string[];
  certifications: string[];
  completed_courses: string[];
  skills: string[];
  career_goals: string[];
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  preferred_learning_style: 'visual' | 'hands-on' | 'theoretical' | 'mixed';
}

export interface CourseRecommendation {
  course_id: string;
  course_name: string;
  course_code: string;
  description: string;
  match_score: number;
  reasons: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration: number; // in hours
  prerequisites: string[];
  skills_gained: string[];
  career_relevance: string[];
  instructor?: string;
  category?: string;
}

export interface RecommendationContext {
  student_profile: StudentProfile;
  available_courses: any[];
  recent_activity: any[];
  peer_recommendations: any[];
}

class RecommendationEngine {
  private skillKeywords: { [key: string]: string[] } = {
    web_development: [
      'html',
      'css',
      'javascript',
      'react',
      'node',
      'frontend',
      'backend',
      'fullstack',
    ],
    data_science: [
      'python',
      'r',
      'machine learning',
      'ai',
      'statistics',
      'data analysis',
      'pandas',
      'numpy',
    ],
    mobile_development: [
      'android',
      'ios',
      'flutter',
      'react native',
      'swift',
      'kotlin',
      'mobile',
    ],
    cloud_computing: [
      'aws',
      'azure',
      'gcp',
      'cloud',
      'devops',
      'docker',
      'kubernetes',
      'microservices',
    ],
    cybersecurity: [
      'security',
      'penetration testing',
      'ethical hacking',
      'network security',
      'cryptography',
    ],
    blockchain: [
      'blockchain',
      'cryptocurrency',
      'solidity',
      'ethereum',
      'defi',
      'nft',
      'web3',
    ],
    game_development: [
      'unity',
      'unreal',
      'game design',
      'c#',
      'c++',
      'gaming',
      '3d modeling',
    ],
    database: [
      'sql',
      'mysql',
      'postgresql',
      'mongodb',
      'database design',
      'nosql',
    ],
    algorithms: [
      'algorithms',
      'data structures',
      'competitive programming',
      'leetcode',
      'codeforces',
    ],
    ui_ux: [
      'ui',
      'ux',
      'design',
      'figma',
      'adobe',
      'user experience',
      'interface design',
    ],
  };

  private certificationKeywords: { [key: string]: string[] } = {
    aws_certified: [
      'aws',
      'cloud',
      'amazon web services',
      'ec2',
      's3',
      'lambda',
    ],
    google_certified: [
      'google cloud',
      'gcp',
      'data analytics',
      'machine learning',
    ],
    microsoft_certified: [
      'azure',
      'microsoft',
      'office 365',
      'power bi',
      'dynamics',
    ],
    cisco_certified: [
      'cisco',
      'networking',
      'ccna',
      'ccnp',
      'routing',
      'switching',
    ],
    comptia_certified: [
      'comptia',
      'a+',
      'network+',
      'security+',
      'it fundamentals',
    ],
    pmp_certified: ['project management', 'pmp', 'agile', 'scrum', 'pmi'],
    salesforce_certified: ['salesforce', 'crm', 'sales cloud', 'service cloud'],
    oracle_certified: ['oracle', 'java', 'database', 'sql', 'pl/sql'],
    adobe_certified: [
      'adobe',
      'photoshop',
      'illustrator',
      'creative cloud',
      'design',
    ],
    google_analytics: [
      'google analytics',
      'ga4',
      'digital marketing',
      'seo',
      'sem',
    ],
  };

  /**
   * Calculate match score between student profile and course
   */
  private calculateMatchScore(profile: StudentProfile, course: any): number {
    let score = 0;
    const reasons: string[] = [];

    // Interest matching (40% weight)
    const interestScore = this.calculateInterestMatch(
      profile.interests,
      course
    );
    score += interestScore * 0.4;
    if (interestScore > 0.7) {
      reasons.push(
        `Matches your interests in ${this.getMatchingInterests(profile.interests, course)}`
      );
    }

    // Certification alignment (25% weight)
    const certScore = this.calculateCertificationMatch(
      profile.certifications,
      course
    );
    score += certScore * 0.25;
    if (certScore > 0.6) {
      reasons.push(
        `Builds on your ${this.getMatchingCertifications(profile.certifications, course)} certification`
      );
    }

    // Skill progression (20% weight)
    const skillScore = this.calculateSkillProgression(profile.skills, course);
    score += skillScore * 0.2;
    if (skillScore > 0.5) {
      reasons.push(
        `Develops your ${this.getMatchingSkills(profile.skills, course)} skills further`
      );
    }

    // Career goal alignment (10% weight)
    const careerScore = this.calculateCareerAlignment(
      profile.career_goals,
      course
    );
    score += careerScore * 0.1;
    if (careerScore > 0.6) {
      reasons.push(
        `Aligns with your career goals in ${this.getMatchingCareerGoals(profile.career_goals, course)}`
      );
    }

    // Experience level matching (5% weight)
    const experienceScore = this.calculateExperienceMatch(
      profile.experience_level,
      course
    );
    score += experienceScore * 0.05;
    if (experienceScore > 0.8) {
      reasons.push(
        `Perfect difficulty level for your ${profile.experience_level} experience`
      );
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  private calculateInterestMatch(interests: string[], course: any): number {
    if (!interests.length) return 0.5; // Neutral if no interests specified

    const courseText =
      `${course.name} ${course.description || ''} ${course.course_code || ''}`.toLowerCase();
    let matches = 0;

    for (const interest of interests) {
      const keywords = this.skillKeywords[interest.toLowerCase()] || [
        interest.toLowerCase(),
      ];
      for (const keyword of keywords) {
        if (courseText.includes(keyword)) {
          matches++;
          break;
        }
      }
    }

    return matches / interests.length;
  }

  private calculateCertificationMatch(
    certifications: string[],
    course: any
  ): number {
    if (!certifications.length) return 0.3; // Slight boost if no certs

    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();
    let matches = 0;

    for (const cert of certifications) {
      const keywords = this.certificationKeywords[cert.toLowerCase()] || [
        cert.toLowerCase(),
      ];
      for (const keyword of keywords) {
        if (courseText.includes(keyword)) {
          matches++;
          break;
        }
      }
    }

    return matches / certifications.length;
  }

  private calculateSkillProgression(skills: string[], course: any): number {
    if (!skills.length) return 0.5;

    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();
    let matches = 0;

    for (const skill of skills) {
      if (courseText.includes(skill.toLowerCase())) {
        matches++;
      }
    }

    return matches / skills.length;
  }

  private calculateCareerAlignment(careerGoals: string[], course: any): number {
    if (!careerGoals.length) return 0.5;

    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();
    let matches = 0;

    for (const goal of careerGoals) {
      if (courseText.includes(goal.toLowerCase())) {
        matches++;
      }
    }

    return matches / careerGoals.length;
  }

  private calculateExperienceMatch(
    experienceLevel: string,
    course: any
  ): number {
    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();

    // Simple keyword-based difficulty detection
    const beginnerKeywords = [
      'introduction',
      'beginner',
      'basics',
      'fundamentals',
      'getting started',
    ];
    const intermediateKeywords = [
      'intermediate',
      'advanced',
      'deep dive',
      'mastery',
      'expert',
    ];
    const advancedKeywords = [
      'expert',
      'master',
      'professional',
      'enterprise',
      'architecture',
    ];

    const hasBeginner = beginnerKeywords.some(keyword =>
      courseText.includes(keyword)
    );
    const hasIntermediate = intermediateKeywords.some(keyword =>
      courseText.includes(keyword)
    );
    const hasAdvanced = advancedKeywords.some(keyword =>
      courseText.includes(keyword)
    );

    switch (experienceLevel) {
      case 'beginner':
        return hasBeginner
          ? 1.0
          : hasIntermediate
            ? 0.7
            : hasAdvanced
              ? 0.3
              : 0.5;
      case 'intermediate':
        return hasIntermediate
          ? 1.0
          : hasBeginner
            ? 0.8
            : hasAdvanced
              ? 0.6
              : 0.5;
      case 'advanced':
        return hasAdvanced
          ? 1.0
          : hasIntermediate
            ? 0.8
            : hasBeginner
              ? 0.4
              : 0.5;
      default:
        return 0.5;
    }
  }

  private getMatchingInterests(interests: string[], course: any): string {
    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();
    const matches = interests.filter(interest => {
      const keywords = this.skillKeywords[interest.toLowerCase()] || [
        interest.toLowerCase(),
      ];
      return keywords.some(keyword => courseText.includes(keyword));
    });
    return matches.join(', ');
  }

  private getMatchingCertifications(
    certifications: string[],
    course: any
  ): string {
    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();
    const matches = certifications.filter(cert => {
      const keywords = this.certificationKeywords[cert.toLowerCase()] || [
        cert.toLowerCase(),
      ];
      return keywords.some(keyword => courseText.includes(keyword));
    });
    return matches.join(', ');
  }

  private getMatchingSkills(skills: string[], course: any): string {
    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();
    const matches = skills.filter(skill =>
      courseText.includes(skill.toLowerCase())
    );
    return matches.join(', ');
  }

  private getMatchingCareerGoals(careerGoals: string[], course: any): string {
    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();
    const matches = careerGoals.filter(goal =>
      courseText.includes(goal.toLowerCase())
    );
    return matches.join(', ');
  }

  /**
   * Generate course recommendations for a student
   */
  async generateRecommendations(
    studentId: string,
    limit: number = 10
  ): Promise<CourseRecommendation[]> {
    try {
      // Fetch student profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();

      if (profileError || !profile) {
        throw new Error('Student profile not found');
      }

      // Fetch available courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) {
        throw new Error('Failed to fetch courses');
      }

      // Create student profile object
      const studentProfile: StudentProfile = {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        interests: profile.interests || [],
        certifications: profile.certifications || [],
        completed_courses: profile.completed_courses || [],
        skills: profile.skills || [],
        career_goals: profile.career_goals || [],
        experience_level: profile.experience_level || 'beginner',
        preferred_learning_style: profile.preferred_learning_style || 'mixed',
      };

      // Calculate recommendations
      const recommendations: CourseRecommendation[] = [];

      for (const course of courses || []) {
        // Skip if already completed
        if (studentProfile.completed_courses.includes(course.id)) {
          continue;
        }

        const matchScore = this.calculateMatchScore(studentProfile, course);

        if (matchScore > 0.3) {
          // Only recommend courses with decent match
          const reasons: string[] = [];

          // Generate reasons based on match factors
          if (
            this.calculateInterestMatch(studentProfile.interests, course) > 0.7
          ) {
            reasons.push(
              `Matches your interests in ${this.getMatchingInterests(studentProfile.interests, course)}`
            );
          }

          if (
            this.calculateCertificationMatch(
              studentProfile.certifications,
              course
            ) > 0.6
          ) {
            reasons.push(
              `Builds on your ${this.getMatchingCertifications(studentProfile.certifications, course)} certification`
            );
          }

          if (
            this.calculateSkillProgression(studentProfile.skills, course) > 0.5
          ) {
            reasons.push(
              `Develops your ${this.getMatchingSkills(studentProfile.skills, course)} skills further`
            );
          }

          recommendations.push({
            course_id: course.id,
            course_name: course.name,
            course_code: course.course_code,
            description: course.description || '',
            match_score: matchScore,
            reasons: reasons,
            difficulty_level: this.determineDifficultyLevel(course),
            estimated_duration: this.estimateDuration(course),
            prerequisites: this.extractPrerequisites(course),
            skills_gained: this.extractSkillsGained(course),
            career_relevance: this.extractCareerRelevance(course),
            instructor: course.instructor || 'Course Instructor',
            category: course.category || this.determineCategory(course),
          });
        }
      }

      // Sort by match score and return top recommendations
      return recommendations
        .sort((a, b) => b.match_score - a.match_score)
        .slice(0, limit);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private determineDifficultyLevel(
    course: any
  ): 'beginner' | 'intermediate' | 'advanced' {
    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();

    if (
      courseText.includes('advanced') ||
      courseText.includes('expert') ||
      courseText.includes('master')
    ) {
      return 'advanced';
    } else if (
      courseText.includes('intermediate') ||
      courseText.includes('intermediate')
    ) {
      return 'intermediate';
    } else {
      return 'beginner';
    }
  }

  private estimateDuration(course: any): number {
    // Simple estimation based on course name and description
    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();

    if (courseText.includes('intensive') || courseText.includes('bootcamp')) {
      return 40; // 40 hours
    } else if (
      courseText.includes('comprehensive') ||
      courseText.includes('complete')
    ) {
      return 20; // 20 hours
    } else if (courseText.includes('quick') || courseText.includes('crash')) {
      return 5; // 5 hours
    } else {
      return 10; // Default 10 hours
    }
  }

  private extractPrerequisites(course: any): string[] {
    // Simple extraction from description
    const description = course.description || '';
    const prerequisites: string[] = [];

    // Look for common prerequisite patterns
    const patterns = [
      /prerequisites?:?\s*([^.]+)/i,
      /required:?\s*([^.]+)/i,
      /you should know:?\s*([^.]+)/i,
    ];

    for (const pattern of patterns) {
      const match = description.match(pattern);
      if (match) {
        prerequisites.push(match[1].trim());
      }
    }

    return prerequisites;
  }

  private extractSkillsGained(course: any): string[] {
    // Extract skills from course name and description
    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();
    const skills: string[] = [];

    // Common skill keywords
    const skillKeywords = [
      'javascript',
      'python',
      'react',
      'node.js',
      'html',
      'css',
      'sql',
      'mongodb',
      'aws',
      'docker',
      'kubernetes',
      'git',
      'linux',
      'data analysis',
      'machine learning',
      'ui/ux',
      'mobile development',
      'web development',
      'cybersecurity',
      'blockchain',
    ];

    for (const skill of skillKeywords) {
      if (courseText.includes(skill)) {
        skills.push(skill);
      }
    }

    return skills;
  }

  private extractCareerRelevance(course: any): string[] {
    // Extract career relevance from course content
    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();
    const careers: string[] = [];

    const careerKeywords = [
      'software engineer',
      'data scientist',
      'web developer',
      'mobile developer',
      'devops engineer',
      'cybersecurity analyst',
      'ui/ux designer',
      'product manager',
      'cloud architect',
      'machine learning engineer',
      'blockchain developer',
    ];

    for (const career of careerKeywords) {
      if (courseText.includes(career)) {
        careers.push(career);
      }
    }

    return careers;
  }

  private determineCategory(course: any): string {
    const courseText =
      `${course.name} ${course.description || ''}`.toLowerCase();

    if (
      courseText.includes('web') ||
      courseText.includes('html') ||
      courseText.includes('css') ||
      courseText.includes('javascript')
    ) {
      return 'Web Development';
    } else if (
      courseText.includes('data') ||
      courseText.includes('machine learning') ||
      courseText.includes('ai') ||
      courseText.includes('python')
    ) {
      return 'Data Science';
    } else if (
      courseText.includes('mobile') ||
      courseText.includes('android') ||
      courseText.includes('ios') ||
      courseText.includes('flutter')
    ) {
      return 'Mobile Development';
    } else if (
      courseText.includes('cloud') ||
      courseText.includes('aws') ||
      courseText.includes('azure') ||
      courseText.includes('gcp')
    ) {
      return 'Cloud Computing';
    } else if (
      courseText.includes('security') ||
      courseText.includes('cyber') ||
      courseText.includes('hack')
    ) {
      return 'Cybersecurity';
    } else if (
      courseText.includes('blockchain') ||
      courseText.includes('crypto') ||
      courseText.includes('ethereum')
    ) {
      return 'Blockchain';
    } else if (
      courseText.includes('game') ||
      courseText.includes('unity') ||
      courseText.includes('unreal')
    ) {
      return 'Game Development';
    } else if (
      courseText.includes('database') ||
      courseText.includes('sql') ||
      courseText.includes('mysql')
    ) {
      return 'Database';
    } else if (
      courseText.includes('algorithm') ||
      courseText.includes('leetcode') ||
      courseText.includes('codeforces')
    ) {
      return 'Algorithms';
    } else if (
      courseText.includes('ui') ||
      courseText.includes('ux') ||
      courseText.includes('design')
    ) {
      return 'UI/UX';
    } else {
      return 'Programming';
    }
  }

  /**
   * Update student profile with new interests, certifications, etc.
   */
  async updateStudentProfile(
    studentId: string,
    updates: Partial<StudentProfile>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', studentId);

      return !error;
    } catch (error) {
      console.error('Error updating student profile:', error);
      return false;
    }
  }
}

export const recommendationEngine = new RecommendationEngine();
