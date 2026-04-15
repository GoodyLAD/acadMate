// Global type definitions for the application

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'faculty' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface Profile extends User {
  faculty_level?: 'basic' | 'senior' | 'admin';
  student_id?: string;
  faculty_id?: string;
  assigned_faculty_id?: string;
  department?: string;
  avatar_url?: string;
  bio?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  location?: string;
  graduation_year?: number;
}

export interface Certificate {
  id: string;
  student_id: string;
  title: string;
  description?: string;
  category: 'academic' | 'co_curricular';
  status: 'pending' | 'approved' | 'rejected';
  file_url: string;
  file_name: string;
  uploaded_at: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  remark?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read_at?: string;
}

// Re-export commonly used types
export type { User, Profile, Certificate, Notification };
