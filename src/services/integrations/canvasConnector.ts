// Canvas LMS Integration Connector
// This service handles integration with Canvas Learning Management System

import { lmsIntegrationService } from '../api/lmsIntegrationService';

export interface CanvasConfig {
  baseUrl: string;
  accessToken: string;
  apiVersion: string;
}

export interface CanvasUser {
  id: number;
  name: string;
  created_at: string;
  sortable_name: string;
  short_name: string;
  sis_user_id?: string;
  integration_id?: string;
  login_id: string;
  avatar_url?: string;
  enrollments?: CanvasEnrollment[];
  email: string;
  locale?: string;
  last_login?: string;
  time_zone?: string;
  bio?: string;
}

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  workflow_state: string;
  account_id: number;
  uuid: string;
  start_at?: string;
  grading_standard_id?: number;
  is_public: boolean;
  created_at: string;
  course_format?: string;
  apply_assignment_group_weights: boolean;
  calendar: {
    ics?: string;
  };
  time_zone: string;
  blueprint?: boolean;
  blueprint_restrictions?: any;
  blueprint_restrictions_by_object_type?: any;
  template?: boolean;
  enrollment_term_id: number;
  sis_course_id?: string;
  integration_id?: string;
  end_at?: string;
  public_syllabus: boolean;
  public_syllabus_to_auth: boolean;
  public_description?: string;
  storage_quota_mb: number;
  storage_quota_used_mb: number;
  hide_final_grades: boolean;
  license?: string;
  allow_student_assignment_edits: boolean;
  allow_wiki_comments: boolean;
  allow_student_forum_attachments: boolean;
  open_enrollment: boolean;
  self_enrollment: boolean;
  restrict_enrollments_to_course_dates: boolean;
  course_format_option?: string;
  apply_assignment_group_weights: boolean;
  calendar: {
    ics?: string;
  };
  time_zone: string;
  blueprint?: boolean;
  blueprint_restrictions?: any;
  blueprint_restrictions_by_object_type?: any;
  template?: boolean;
  enrollment_term_id: number;
  sis_course_id?: string;
  integration_id?: string;
  end_at?: string;
  public_syllabus: boolean;
  public_syllabus_to_auth: boolean;
  public_description?: string;
  storage_quota_mb: number;
  storage_quota_used_mb: number;
  hide_final_grades: boolean;
  license?: string;
  allow_student_assignment_edits: boolean;
  allow_wiki_comments: boolean;
  allow_student_forum_attachments: boolean;
  open_enrollment: boolean;
  self_enrollment: boolean;
  restrict_enrollments_to_course_dates: boolean;
  course_format_option?: string;
}

export interface CanvasEnrollment {
  id: number;
  course_id: number;
  user_id: number;
  type: string;
  created_at: string;
  updated_at: string;
  associated_user_id?: number;
  start_at?: string;
  end_at?: string;
  course_section_id: number;
  root_account_id: number;
  limit_privileges_to_course_section: boolean;
  enrollment_state: string;
  role: string;
  role_id: number;
  last_activity_at?: string;
  last_attended_at?: string;
  total_activity_time: number;
  html_url: string;
  grades: {
    html_url: string;
    current_grade?: string;
    current_score?: number;
    current_points?: number;
    unposted_current_grade?: string;
    unposted_current_score?: number;
    unposted_current_points?: number;
    final_grade?: string;
    final_score?: number;
    final_points?: number;
    unposted_final_grade?: string;
    unposted_final_score?: number;
    unposted_final_points?: number;
  };
  user: CanvasUser;
  locked: boolean;
}

export class CanvasConnector {
  private config: CanvasConfig;

  constructor(config: CanvasConfig) {
    this.config = config;
  }

  // Authentication
  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/v1/users/self`, {
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Canvas authentication failed:', error);
      return false;
    }
  }

  // User Management
  async getUsers(
    options: {
      search_term?: string;
      enrollment_type?: string;
      enrollment_role?: string;
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<CanvasUser[]> {
    try {
      const params = new URLSearchParams();

      if (options.search_term)
        params.append('search_term', options.search_term);
      if (options.enrollment_type)
        params.append('enrollment_type', options.enrollment_type);
      if (options.enrollment_role)
        params.append('enrollment_role', options.enrollment_role);
      if (options.per_page) params.append('per_page', String(options.per_page));
      if (options.page) params.append('page', String(options.page));

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/accounts/self/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Canvas API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Canvas users:', error);
      throw error;
    }
  }

  async getUser(userId: number): Promise<CanvasUser> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Canvas API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Canvas user:', error);
      throw error;
    }
  }

  async createUser(userData: {
    user: {
      name: string;
      short_name?: string;
      sortable_name?: string;
      time_zone?: string;
      email: string;
      password?: string;
      sis_user_id?: string;
      integration_id?: string;
      send_confirmation?: boolean;
      terms_of_use?: boolean;
      skip_registration?: boolean;
      authentication_provider_id?: string;
    };
    pseudonym: {
      unique_id: string;
      password?: string;
      sis_user_id?: string;
      integration_id?: string;
      authentication_provider_id?: string;
    };
    communication_channel?: {
      type: string;
      address: string;
      skip_confirmation?: boolean;
    };
  }): Promise<CanvasUser> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/accounts/self/users`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Canvas API error: ${error.message || response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Canvas user:', error);
      throw error;
    }
  }

  async updateUser(
    userId: number,
    userData: Partial<CanvasUser>
  ): Promise<CanvasUser> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Canvas API error: ${error.message || response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating Canvas user:', error);
      throw error;
    }
  }

  // Course Management
  async getCourses(
    options: {
      enrollment_type?: string;
      enrollment_role?: string;
      enrollment_role_id?: number;
      exclude_blueprint_courses?: boolean;
      include?: string[];
      state?: string[];
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<CanvasCourse[]> {
    try {
      const params = new URLSearchParams();

      if (options.enrollment_type)
        params.append('enrollment_type', options.enrollment_type);
      if (options.enrollment_role)
        params.append('enrollment_role', options.enrollment_role);
      if (options.enrollment_role_id)
        params.append('enrollment_role_id', String(options.enrollment_role_id));
      if (options.exclude_blueprint_courses)
        params.append('exclude_blueprint_courses', 'true');
      if (options.include) params.append('include', options.include.join(','));
      if (options.state) params.append('state[]', options.state.join(','));
      if (options.per_page) params.append('per_page', String(options.per_page));
      if (options.page) params.append('page', String(options.page));

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/courses?${params}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Canvas API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Canvas courses:', error);
      throw error;
    }
  }

  async getCourse(courseId: number): Promise<CanvasCourse> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/courses/${courseId}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Canvas API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Canvas course:', error);
      throw error;
    }
  }

  // Enrollment Management
  async getEnrollments(
    courseId: number,
    options: {
      type?: string[];
      role?: string[];
      state?: string[];
      include?: string[];
      user_id?: number;
      grading_period_id?: number;
      enrollment_term_id?: number;
      per_page?: number;
      page?: number;
    } = {}
  ): Promise<CanvasEnrollment[]> {
    try {
      const params = new URLSearchParams();

      if (options.type) params.append('type[]', options.type.join(','));
      if (options.role) params.append('role[]', options.role.join(','));
      if (options.state) params.append('state[]', options.state.join(','));
      if (options.include)
        params.append('include[]', options.include.join(','));
      if (options.user_id) params.append('user_id', String(options.user_id));
      if (options.grading_period_id)
        params.append('grading_period_id', String(options.grading_period_id));
      if (options.enrollment_term_id)
        params.append('enrollment_term_id', String(options.enrollment_term_id));
      if (options.per_page) params.append('per_page', String(options.per_page));
      if (options.page) params.append('page', String(options.page));

      const response = await fetch(
        `${this.config.baseUrl}/api/v1/courses/${courseId}/enrollments?${params}`,
        {
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Canvas API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Canvas enrollments:', error);
      throw error;
    }
  }

  async enrollUser(
    courseId: number,
    enrollmentData: {
      enrollment: {
        user_id: number;
        type: string;
        role?: string;
        role_id?: number;
        enrollment_state?: string;
        limit_privileges_to_course_section?: boolean;
        notify?: boolean;
        self_enrollment_code?: string;
        self_enrolled?: boolean;
        associated_user_id?: number;
      };
    }
  ): Promise<CanvasEnrollment> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/api/v1/courses/${courseId}/enrollments`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(enrollmentData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          `Canvas API error: ${error.message || response.status}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error('Error enrolling user in Canvas course:', error);
      throw error;
    }
  }

  // Data Synchronization
  async syncStudentsToCanvas(): Promise<{ success: number; failed: number }> {
    try {
      // Get all students from SIH2
      const students = await lmsIntegrationService.getStudents();

      let success = 0;
      let failed = 0;

      for (const student of students) {
        try {
          // Check if user exists in Canvas
          const existingUsers = await this.getUsers({
            search_term: student.email,
          });

          const existingUser = existingUsers.find(
            u => u.email === student.email
          );

          if (existingUser) {
            // Update existing user
            await this.updateUser(existingUser.id, {
              name: student.full_name,
              email: student.email,
            });
          } else {
            // Create new user
            await this.createUser({
              user: {
                name: student.full_name,
                email: student.email,
                sis_user_id: student.student_id,
              },
              pseudonym: {
                unique_id: student.email,
              },
            });
          }
          success++;
        } catch (error) {
          console.error(`Failed to sync student ${student.email}:`, error);
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      console.error('Error syncing students to Canvas:', error);
      throw error;
    }
  }

  async syncCoursesFromCanvas(): Promise<{ success: number; failed: number }> {
    try {
      // Get all courses from Canvas
      const canvasCourses = await this.getCourses();

      let success = 0;
      let failed = 0;

      for (const course of canvasCourses) {
        try {
          // Convert Canvas course to SIH2 format
          const courseData = {
            course_code: course.course_code,
            name: course.name,
            description: course.public_description || '',
            credits: 3, // Default credits, could be extracted from course settings
            faculty_id: null, // Would need to map to SIH2 faculty
            semester: 'Fall', // Would need to extract from course dates
            year: new Date(course.created_at).getFullYear(),
          };

          // Check if course exists in SIH2
          const existingCourses = await lmsIntegrationService.getCourses();
          const existingCourse = existingCourses.find(
            c => c.course_code === courseData.course_code
          );

          if (!existingCourse) {
            // Create new course in SIH2
            // This would need to be implemented in the service
          }

          success++;
        } catch (error) {
          console.error(`Failed to sync course ${course.course_code}:`, error);
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      console.error('Error syncing courses from Canvas:', error);
      throw error;
    }
  }
}

export default CanvasConnector;
