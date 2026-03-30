// LMS/ERP Integration Service
// This service handles all external system integrations

import { supabase } from '@/integrations/supabase/client';

export interface LMSIntegrationConfig {
  id: string;
  name: string;
  type: 'moodle' | 'canvas' | 'blackboard' | 'generic' | 'sis' | 'erp';
  baseUrl: string;
  apiKey?: string;
  clientId?: string;
  clientSecret?: string;
  webhookUrl?: string;
  isActive: boolean;
  settings: Record<string, any>;
}

export interface StudentData {
  id: string;
  student_id: string;
  full_name: string;
  email: string;
  department: string;
  graduation_year?: number;
  enrollment_date: string;
  status: 'active' | 'inactive' | 'graduated';
  profile?: {
    phone?: string;
    address?: string;
    emergency_contact?: any;
  };
  academic_info?: {
    gpa?: number;
    credits_earned?: number;
    major?: string;
    minor?: string;
  };
}

export interface CourseData {
  id: string;
  course_code: string;
  name: string;
  description?: string;
  credits: number;
  faculty_id: string;
  semester: string;
  year: number;
  schedule?: {
    days: string[];
    time: string;
    location: string;
  };
  enrollment?: {
    max_students: number;
    current_enrolled: number;
    waitlist: number;
  };
}

export interface AchievementData {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  category: 'academic' | 'co_curricular';
  type: 'certificate' | 'badge' | 'milestone';
  points: number;
  earned_date: string;
  verified_by?: string;
  verified_date?: string;
  status: 'pending' | 'approved' | 'rejected';
  metadata?: Record<string, any>;
}

export interface WebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  resource_id: string;
  data: any;
  timestamp: string;
  processed: boolean;
  retry_count: number;
}

export class LMSIntegrationService {
  private static instance: LMSIntegrationService;

  static getInstance(): LMSIntegrationService {
    if (!LMSIntegrationService.instance) {
      LMSIntegrationService.instance = new LMSIntegrationService();
    }
    return LMSIntegrationService.instance;
  }

  // Student Management APIs
  async getStudents(filters?: {
    department?: string;
    status?: string;
    graduation_year?: number;
    limit?: number;
    offset?: number;
  }): Promise<StudentData[]> {
    try {
      let query = supabase.from('profiles').select('*').eq('role', 'student');

      if (filters?.department) {
        query = query.eq('department', filters.department);
      }
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.graduation_year) {
        query = query.eq('graduation_year', filters.graduation_year);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(this.mapProfileToStudentData);
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  async getStudent(id: string): Promise<StudentData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .eq('role', 'student')
        .single();

      if (error) throw error;
      return data ? this.mapProfileToStudentData(data) : null;
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  }

  async createStudent(
    studentData: Omit<StudentData, 'id'>
  ): Promise<StudentData> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          student_id: studentData.student_id,
          full_name: studentData.full_name,
          email: studentData.email,
          department: studentData.department,
          graduation_year: studentData.graduation_year,
          role: 'student',
          status: studentData.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return this.mapProfileToStudentData(data);
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  }

  async updateStudent(
    id: string,
    updates: Partial<StudentData>
  ): Promise<StudentData> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('role', 'student')
        .select()
        .single();

      if (error) throw error;
      return this.mapProfileToStudentData(data);
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  }

  // Course Management APIs
  async getCourses(filters?: {
    faculty_id?: string;
    semester?: string;
    year?: number;
    limit?: number;
    offset?: number;
  }): Promise<CourseData[]> {
    try {
      let query = supabase.from('courses').select('*');

      if (filters?.faculty_id) {
        query = query.eq('faculty_id', filters.faculty_id);
      }
      if (filters?.semester) {
        query = query.eq('semester', filters.semester);
      }
      if (filters?.year) {
        query = query.eq('year', filters.year);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(this.mapCourseToCourseData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  async getCourse(id: string): Promise<CourseData | null> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? this.mapCourseToCourseData(data) : null;
    } catch (error) {
      console.error('Error fetching course:', error);
      throw error;
    }
  }

  // Achievement Management APIs
  async getStudentAchievements(studentId: string): Promise<AchievementData[]> {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', studentId);

      if (error) throw error;

      return data.map(this.mapCertificateToAchievementData);
    } catch (error) {
      console.error('Error fetching student achievements:', error);
      throw error;
    }
  }

  // Data Export APIs
  async exportStudents(format: 'json' | 'csv' | 'xml'): Promise<string> {
    try {
      const students = await this.getStudents();

      switch (format) {
        case 'json':
          return JSON.stringify(students, null, 2);
        case 'csv':
          return this.convertToCSV(students);
        case 'xml':
          return this.convertToXML(students, 'students');
        default:
          throw new Error('Unsupported format');
      }
    } catch (error) {
      console.error('Error exporting students:', error);
      throw error;
    }
  }

  async exportCourses(format: 'json' | 'csv' | 'xml'): Promise<string> {
    try {
      const courses = await this.getCourses();

      switch (format) {
        case 'json':
          return JSON.stringify(courses, null, 2);
        case 'csv':
          return this.convertToCSV(courses);
        case 'xml':
          return this.convertToXML(courses, 'courses');
        default:
          throw new Error('Unsupported format');
      }
    } catch (error) {
      console.error('Error exporting courses:', error);
      throw error;
    }
  }

  // Webhook Management
  async registerWebhook(config: {
    url: string;
    events: string[];
    secret?: string;
  }): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('webhooks')
        .insert({
          url: config.url,
          events: config.events,
          secret: config.secret,
          is_active: true,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error registering webhook:', error);
      throw error;
    }
  }

  async triggerWebhook(
    eventType: string,
    resourceType: string,
    resourceId: string,
    data: any
  ): Promise<void> {
    try {
      // Get active webhooks for this event type
      const { data: webhooks, error } = await supabase
        .from('webhooks')
        .select('*')
        .eq('is_active', true)
        .contains('events', [eventType]);

      if (error) throw error;

      // Send webhook to each registered URL
      for (const webhook of webhooks) {
        try {
          await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Event': eventType,
              'X-Webhook-Signature': this.generateSignature(
                data,
                webhook.secret
              ),
            },
            body: JSON.stringify({
              event_type: eventType,
              resource_type: resourceType,
              resource_id: resourceId,
              data: data,
              timestamp: new Date().toISOString(),
            }),
          });
        } catch (webhookError) {
          console.error(`Webhook failed for ${webhook.url}:`, webhookError);
        }
      }
    } catch (error) {
      console.error('Error triggering webhook:', error);
      throw error;
    }
  }

  // Helper Methods
  private mapProfileToStudentData(profile: any): StudentData {
    return {
      id: profile.id,
      student_id: profile.student_id || '',
      full_name: profile.full_name,
      email: profile.email,
      department: profile.department || '',
      graduation_year: profile.graduation_year,
      enrollment_date: profile.created_at,
      status: profile.status || 'active',
      profile: {
        phone: profile.phone,
        address: profile.address,
        emergency_contact: profile.emergency_contact,
      },
      academic_info: {
        gpa: profile.gpa,
        credits_earned: profile.credits_earned,
        major: profile.major,
        minor: profile.minor,
      },
    };
  }

  private mapCourseToCourseData(course: any): CourseData {
    return {
      id: course.id,
      course_code: course.course_code,
      name: course.name,
      description: course.description,
      credits: course.credit_hours || 0,
      faculty_id: course.faculty_id,
      semester: course.semester || '',
      year: course.year || new Date().getFullYear(),
      schedule: course.schedule,
      enrollment: {
        max_students: course.max_students || 0,
        current_enrolled: course.assigned_student_ids?.length || 0,
        waitlist: course.waitlist || 0,
      },
    };
  }

  private mapCertificateToAchievementData(certificate: any): AchievementData {
    return {
      id: certificate.id,
      student_id: certificate.student_id,
      title: certificate.title,
      description: certificate.description,
      category: certificate.category,
      type: 'certificate',
      points: certificate.points || 0,
      earned_date: certificate.uploaded_at,
      verified_by: certificate.verified_by,
      verified_date: certificate.verified_at,
      status: certificate.status,
      metadata: {
        file_url: certificate.file_url,
        file_name: certificate.file_name,
      },
    };
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => JSON.stringify(row[header] || '')).join(',')
      ),
    ].join('\n');

    return csvContent;
  }

  private convertToXML(data: any[], rootElement: string): string {
    const xml = data
      .map(item => {
        const entries = Object.entries(item)
          .map(([key, value]) => `  <${key}>${JSON.stringify(value)}</${key}>`)
          .join('\n');
        return `  <item>\n${entries}\n  </item>`;
      })
      .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n${xml}\n</${rootElement}>`;
  }

  private generateSignature(data: any, secret?: string): string {
    if (!secret) return '';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const crypto = require('crypto');
    const payload = JSON.stringify(data);
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }
}

export const lmsIntegrationService = LMSIntegrationService.getInstance();
