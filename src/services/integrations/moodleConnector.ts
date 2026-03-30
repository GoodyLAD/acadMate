// Moodle LMS Integration Connector
// This service handles integration with Moodle Learning Management System

import { lmsIntegrationService } from '../api/lmsIntegrationService';

export interface MoodleConfig {
  baseUrl: string;
  token: string;
  service: string;
  version: string;
}

export interface MoodleUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  department?: string;
  idnumber?: string;
  phone1?: string;
  address?: string;
  city?: string;
  country?: string;
  timezone?: string;
  lang?: string;
  firstaccess?: number;
  lastaccess?: number;
  suspended?: boolean;
  confirmed?: boolean;
}

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  displayname: string;
  summary: string;
  summaryformat: number;
  startdate: number;
  enddate: number;
  visible: boolean;
  categoryid: number;
  categorysortorder: number;
  idnumber: string;
  format: string;
  showgrades: boolean;
  newsitems: number;
  timecreated: number;
  timemodified: number;
  defaultgroupingid: number;
  enablecompletion: boolean;
  completionnotify: boolean;
  lang: string;
  theme: string;
  maxbytes: number;
  legacyfiles: number;
  maxattachments: number;
  revision: number;
  summaryfiles: any[];
  overviewfiles: any[];
  contacts: any[];
  enrolledusercount: number;
  courseimage: string;
  progress: number;
  hasprogress: boolean;
  isfavourite: boolean;
  hidden: boolean;
  showactivitydates: boolean;
  showcompletionconditions: boolean;
}

export interface MoodleEnrollment {
  id: number;
  courseid: number;
  userid: number;
  status: number;
  timestart: number;
  timeend: number;
  modifierid: number;
  timecreated: number;
  timemodified: number;
}

export class MoodleConnector {
  private config: MoodleConfig;

  constructor(config: MoodleConfig) {
    this.config = config;
  }

  // Authentication
  async authenticate(): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/webservice/rest/server.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            wstoken: this.config.token,
            wsfunction: 'core_webservice_get_site_info',
            moodlewsrestformat: 'json',
          }),
        }
      );

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error('Moodle authentication failed:', error);
      return false;
    }
  }

  // User Management
  async getUsers(
    criteria: { key: string; value: string }[]
  ): Promise<MoodleUser[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.token,
        wsfunction: 'core_user_get_users',
        moodlewsrestformat: 'json',
      });

      // Add criteria
      criteria.forEach((criterion, index) => {
        params.append(`criteria[${index}][key]`, criterion.key);
        params.append(`criteria[${index}][value]`, criterion.value);
      });

      const response = await fetch(
        `${this.config.baseUrl}/webservice/rest/server.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.users || [];
    } catch (error) {
      console.error('Error fetching Moodle users:', error);
      throw error;
    }
  }

  async createUser(userData: Partial<MoodleUser>): Promise<MoodleUser> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.token,
        wsfunction: 'core_user_create_users',
        moodlewsrestformat: 'json',
      });

      // Add user data
      Object.entries(userData).forEach(([key, value]) => {
        params.append(`users[0][${key}]`, String(value));
      });

      const response = await fetch(
        `${this.config.baseUrl}/webservice/rest/server.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.users[0];
    } catch (error) {
      console.error('Error creating Moodle user:', error);
      throw error;
    }
  }

  async updateUser(
    userId: number,
    userData: Partial<MoodleUser>
  ): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.token,
        wsfunction: 'core_user_update_users',
        moodlewsrestformat: 'json',
      });

      // Add user data with ID
      params.append('users[0][id]', String(userId));
      Object.entries(userData).forEach(([key, value]) => {
        params.append(`users[0][${key}]`, String(value));
      });

      const response = await fetch(
        `${this.config.baseUrl}/webservice/rest/server.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error('Error updating Moodle user:', error);
      throw error;
    }
  }

  // Course Management
  async getCourses(
    options: {
      categoryid?: number;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<MoodleCourse[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.token,
        wsfunction: 'core_course_get_courses',
        moodlewsrestformat: 'json',
      });

      if (options.categoryid) {
        params.append('categoryid', String(options.categoryid));
      }

      const response = await fetch(
        `${this.config.baseUrl}/webservice/rest/server.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      let courses = data || [];

      // Apply pagination
      if (options.offset) {
        courses = courses.slice(options.offset);
      }
      if (options.limit) {
        courses = courses.slice(0, options.limit);
      }

      return courses;
    } catch (error) {
      console.error('Error fetching Moodle courses:', error);
      throw error;
    }
  }

  async getCourse(courseId: number): Promise<MoodleCourse> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.token,
        wsfunction: 'core_course_get_courses',
        moodlewsrestformat: 'json',
        options: JSON.stringify({
          ids: [courseId],
        }),
      });

      const response = await fetch(
        `${this.config.baseUrl}/webservice/rest/server.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.courses[0];
    } catch (error) {
      console.error('Error fetching Moodle course:', error);
      throw error;
    }
  }

  // Enrollment Management
  async getEnrollments(courseId: number): Promise<MoodleEnrollment[]> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.token,
        wsfunction: 'core_enrol_get_enrolled_users',
        moodlewsrestformat: 'json',
        courseid: String(courseId),
      });

      const response = await fetch(
        `${this.config.baseUrl}/webservice/rest/server.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching Moodle enrollments:', error);
      throw error;
    }
  }

  async enrollUser(courseId: number, userId: number): Promise<boolean> {
    try {
      const params = new URLSearchParams({
        wstoken: this.config.token,
        wsfunction: 'enrol_manual_enrol_users',
        moodlewsrestformat: 'json',
        enrolments: JSON.stringify([
          {
            roleid: 5, // Student role
            userid: userId,
            courseid: courseId,
          },
        ]),
      });

      const response = await fetch(
        `${this.config.baseUrl}/webservice/rest/server.php`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        }
      );

      const data = await response.json();
      return !data.error;
    } catch (error) {
      console.error('Error enrolling user in Moodle course:', error);
      throw error;
    }
  }

  // Data Synchronization
  async syncStudentsToMoodle(): Promise<{ success: number; failed: number }> {
    try {
      // Get all students from SIH2
      const students = await lmsIntegrationService.getStudents();

      let success = 0;
      let failed = 0;

      for (const student of students) {
        try {
          // Check if user exists in Moodle
          const existingUsers = await this.getUsers([
            { key: 'email', value: student.email },
          ]);

          if (existingUsers.length > 0) {
            // Update existing user
            await this.updateUser(existingUsers[0].id, {
              firstname: student.full_name.split(' ')[0],
              lastname: student.full_name.split(' ').slice(1).join(' '),
              email: student.email,
              department: student.department,
              idnumber: student.student_id,
            });
          } else {
            // Create new user
            await this.createUser({
              username: student.email.split('@')[0],
              firstname: student.full_name.split(' ')[0],
              lastname: student.full_name.split(' ').slice(1).join(' '),
              email: student.email,
              department: student.department,
              idnumber: student.student_id,
              confirmed: true,
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
      console.error('Error syncing students to Moodle:', error);
      throw error;
    }
  }

  async syncCoursesFromMoodle(): Promise<{ success: number; failed: number }> {
    try {
      // Get all courses from Moodle
      const moodleCourses = await this.getCourses();

      let success = 0;
      let failed = 0;

      for (const course of moodleCourses) {
        try {
          // Convert Moodle course to SIH2 format
          const courseData = {
            course_code: course.shortname,
            name: course.fullname,
            description: course.summary,
            credits: 3, // Default credits, could be extracted from course settings
            faculty_id: null, // Would need to map to SIH2 faculty
            semester: 'Fall', // Would need to extract from course dates
            year: new Date(course.startdate * 1000).getFullYear(),
          };

          // Check if course exists in SIH2
          const existingCourses = await lmsIntegrationService.getCourses({
            faculty_id: courseData.faculty_id,
          });

          const existingCourse = existingCourses.find(
            c => c.course_code === courseData.course_code
          );

          if (!existingCourse) {
            // Create new course in SIH2
            // This would need to be implemented in the service
          }

          success++;
        } catch (error) {
          console.error(`Failed to sync course ${course.shortname}:`, error);
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      console.error('Error syncing courses from Moodle:', error);
      throw error;
    }
  }
}

export default MoodleConnector;
