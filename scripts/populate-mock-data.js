#!/usr/bin/env node

/**
 * Script to populate the database with mock data for testing
 * Run with: node scripts/populate-mock-data.js
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Please check your .env file for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mock data
const mockStudents = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'student',
    student_id: 'STU001',
    department: 'Computer Science',
    bio: 'Passionate about web development and AI',
    graduation_year: 2025,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    user_id: '550e8400-e29b-41d4-a716-446655440002',
    full_name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'student',
    student_id: 'STU002',
    department: 'Data Science',
    bio: 'Data enthusiast and machine learning researcher',
    graduation_year: 2024,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockFaculty = {
  id: '550e8400-e29b-41d4-a716-446655440003',
  user_id: '550e8400-e29b-41d4-a716-446655440003',
  full_name: 'Dr. Sarah Johnson',
  email: 'sarah.johnson@university.edu',
  role: 'faculty',
  faculty_level: 'senior',
  faculty_id: 'FAC001',
  department: 'Computer Science',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const mockCertificates = [
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'AWS Cloud Practitioner',
    description: 'Amazon Web Services Cloud Practitioner Certification',
    category: 'academic',
    status: 'approved',
    file_url: 'https://example.com/cert1.pdf',
    file_name: 'aws_cloud_practitioner.pdf',
    uploaded_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    verified_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    verified_by: '550e8400-e29b-41d4-a716-446655440003',
    remark: 'Excellent work!'
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'React Developer Certification',
    description: 'Meta React Developer Professional Certificate',
    category: 'co_curricular',
    status: 'approved',
    file_url: 'https://example.com/cert2.pdf',
    file_name: 'react_developer.pdf',
    uploaded_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    verified_at: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000).toISOString(),
    verified_by: '550e8400-e29b-41d4-a716-446655440003',
    remark: 'Great job!'
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Python Programming Certificate',
    description: 'Python Institute PCAP Certification',
    category: 'academic',
    status: 'pending',
    file_url: 'https://example.com/cert3.pdf',
    file_name: 'python_pcap.pdf',
    uploaded_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Data Science Specialization',
    description: 'Coursera Data Science Specialization',
    category: 'academic',
    status: 'approved',
    file_url: 'https://example.com/cert4.pdf',
    file_name: 'data_science_specialization.pdf',
    uploaded_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    verified_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    verified_by: '550e8400-e29b-41d4-a716-446655440003',
  }
];

const mockProgress = [
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    total_certificates: 3,
    approved_certificates: 2,
    pending_certificates: 1,
    rejected_certificates: 0,
    courses_enrolled: 5,
    courses_completed: 3,
    current_streak_days: 7,
    longest_streak_days: 15,
    total_activities: 12,
    last_activity_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440002',
    total_certificates: 1,
    approved_certificates: 1,
    pending_certificates: 0,
    rejected_certificates: 0,
    courses_enrolled: 3,
    courses_completed: 2,
    current_streak_days: 3,
    longest_streak_days: 8,
    total_activities: 8,
    last_activity_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const mockAchievements = [
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    achievement_type: 'certificate',
    title: 'First Certificate',
    description: 'Earned your first certificate',
    points: 50,
    earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { certificate_title: 'AWS Cloud Practitioner' }
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    achievement_type: 'certificate',
    title: 'Certificate Collector',
    description: 'Earned 2 certificates',
    points: 100,
    earned_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { certificate_count: 2 }
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    achievement_type: 'streak',
    title: 'Week Warrior',
    description: '7 day activity streak',
    points: 75,
    earned_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { streak_days: 7 }
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    achievement_type: 'course_completion',
    title: 'Course Master',
    description: 'Completed 3 courses',
    points: 150,
    earned_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { courses_completed: 3 }
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440002',
    achievement_type: 'certificate',
    title: 'First Certificate',
    description: 'Earned your first certificate',
    points: 50,
    earned_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    metadata: { certificate_title: 'Data Science Specialization' }
  }
];

const mockActivities = [
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    activity_type: 'certificate_upload',
    title: 'Uploaded AWS Certificate',
    description: 'Uploaded AWS Cloud Practitioner certificate for verification',
    metadata: { certificate_id: 'cert1', file_name: 'aws_cloud_practitioner.pdf' },
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    activity_type: 'achievement_earned',
    title: 'Earned First Certificate Achievement',
    description: 'Congratulations! You earned your first certificate',
    metadata: { achievement_id: 'ach1', points: 50 },
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    activity_type: 'certificate_upload',
    title: 'Uploaded React Certificate',
    description: 'Uploaded React Developer Professional Certificate',
    metadata: { certificate_id: 'cert2', file_name: 'react_developer.pdf' },
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    activity_type: 'course_complete',
    title: 'Completed Python Course',
    description: 'Successfully completed Python Programming course',
    metadata: { course_id: 'course1', course_name: 'Python Programming' },
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    activity_type: 'certificate_upload',
    title: 'Uploaded Python Certificate',
    description: 'Uploaded Python Institute PCAP certificate',
    metadata: { certificate_id: 'cert3', file_name: 'python_pcap.pdf' },
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440002',
    activity_type: 'certificate_upload',
    title: 'Uploaded Data Science Certificate',
    description: 'Uploaded Data Science Specialization certificate',
    metadata: { certificate_id: 'cert4', file_name: 'data_science_specialization.pdf' },
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440002',
    activity_type: 'achievement_earned',
    title: 'Earned First Certificate Achievement',
    description: 'Congratulations! You earned your first certificate',
    metadata: { achievement_id: 'ach2', points: 50 },
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const mockGoals = [
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Complete 5 Certifications',
    description: 'Earn 5 professional certifications by end of semester',
    goal_type: 'certificate',
    target_value: 5,
    current_value: 2,
    status: 'active',
    priority: 'high',
    target_date: '2024-06-30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Maintain 30-day Streak',
    description: 'Keep daily activity streak for 30 days',
    goal_type: 'streak',
    target_value: 30,
    current_value: 7,
    status: 'active',
    priority: 'medium',
    target_date: '2024-05-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    student_id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Complete Data Science Projects',
    description: 'Finish 3 data science projects this semester',
    goal_type: 'project',
    target_value: 3,
    current_value: 1,
    status: 'active',
    priority: 'high',
    target_date: '2024-07-31',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

async function populateMockData() {
  try {
    // eslint-disable-next-line no-console
    console.log('🚀 Starting to populate mock data...');

    // 1. Insert faculty member
    // eslint-disable-next-line no-console
    console.log('📝 Inserting faculty member...');
    const { error: facultyError } = await supabase
      .from('profiles')
      .upsert(mockFaculty);
    
    if (facultyError) {
      console.error('Error inserting faculty:', facultyError);
    } else {
      // eslint-disable-next-line no-console
      console.log('✅ Faculty member inserted successfully');
    }

    // 2. Insert students
    // eslint-disable-next-line no-console
    console.log('👥 Inserting students...');
    const { error: studentsError } = await supabase
      .from('profiles')
      .upsert(mockStudents);
    
    if (studentsError) {
      console.error('Error inserting students:', studentsError);
    } else {
      // eslint-disable-next-line no-console
      console.log('✅ Students inserted successfully');
    }

    // 3. Insert certificates
    // eslint-disable-next-line no-console
    console.log('📜 Inserting certificates...');
    const { error: certsError } = await supabase
      .from('certificates')
      .upsert(mockCertificates);
    
    if (certsError) {
      console.error('Error inserting certificates:', certsError);
    } else {
      // eslint-disable-next-line no-console
      console.log('✅ Certificates inserted successfully');
    }

    // 4. Insert progress data
    // eslint-disable-next-line no-console
    console.log('📊 Inserting progress data...');
    const { error: progressError } = await supabase
      .from('student_progress')
      .upsert(mockProgress);
    
    if (progressError) {
      console.error('Error inserting progress:', progressError);
    } else {
      // eslint-disable-next-line no-console
      console.log('✅ Progress data inserted successfully');
    }

    // 5. Insert achievements
    // eslint-disable-next-line no-console
    console.log('🏆 Inserting achievements...');
    const { error: achievementsError } = await supabase
      .from('student_achievements')
      .upsert(mockAchievements);
    
    if (achievementsError) {
      console.error('Error inserting achievements:', achievementsError);
    } else {
      // eslint-disable-next-line no-console
      console.log('✅ Achievements inserted successfully');
    }

    // 6. Insert activities
    // eslint-disable-next-line no-console
    console.log('📈 Inserting activities...');
    const { error: activitiesError } = await supabase
      .from('student_activities')
      .upsert(mockActivities);
    
    if (activitiesError) {
      console.error('Error inserting activities:', activitiesError);
    } else {
      // eslint-disable-next-line no-console
      console.log('✅ Activities inserted successfully');
    }

    // 7. Insert goals
    // eslint-disable-next-line no-console
    console.log('🎯 Inserting goals...');
    const { error: goalsError } = await supabase
      .from('student_goals')
      .upsert(mockGoals);
    
    if (goalsError) {
      console.error('Error inserting goals:', goalsError);
    } else {
      // eslint-disable-next-line no-console
      console.log('✅ Goals inserted successfully');
    }

    // eslint-disable-next-line no-console
    console.log('🎉 Mock data population completed successfully!');
    // eslint-disable-next-line no-console
    console.log('\n📋 Summary:');
    // eslint-disable-next-line no-console
    console.log(`- ${mockStudents.length} students`);
    // eslint-disable-next-line no-console
    console.log(`- ${mockCertificates.length} certificates`);
    // eslint-disable-next-line no-console
    console.log(`- ${mockAchievements.length} achievements`);
    // eslint-disable-next-line no-console
    console.log(`- ${mockActivities.length} activities`);
    // eslint-disable-next-line no-console
    console.log(`- ${mockGoals.length} goals`);
    // eslint-disable-next-line no-console
    console.log(`- ${mockProgress.length} progress records`);
    
    // eslint-disable-next-line no-console
    console.log('\n🔍 Test with these student IDs:');
    // eslint-disable-next-line no-console
    console.log('- John Doe: 550e8400-e29b-41d4-a716-446655440001');
    // eslint-disable-next-line no-console
    console.log('- Jane Smith: 550e8400-e29b-41d4-a716-446655440002');

  } catch (error) {
    console.error('❌ Error populating mock data:', error);
  }
}

// Run the script
populateMockData();
