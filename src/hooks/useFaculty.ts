import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from './useProfile';

export interface StudentMonitoring {
  id: string;
  student_id: string;
  platform: string;
  platform_handle: string;
  solved_count: number;
  contest_count: number;
  rating: number;
  last_updated: string;
  student: {
    id: string;
    full_name: string;
    email: string;
    student_id?: string;
    department?: string;
  };
}

export interface FacultyAssignment {
  id: string;
  faculty_id: string;
  student_id: string;
  assigned_at: string;
  student: {
    id: string;
    full_name: string;
    email: string;
    student_id?: string;
    department?: string;
  };
}

export const useFaculty = () => {
  const { profile } = useProfile();
  const [assignedStudents, setAssignedStudents] = useState<FacultyAssignment[]>(
    []
  );
  const [monitoringData, setMonitoringData] = useState<StudentMonitoring[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  // Fetch assigned students using the faculty_assignments table (our actual schema)
  const fetchAssignedStudents = async () => {
    if (!profile || profile.role !== 'faculty') return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('faculty_assignments')
        .select(
          `
          *,
          student:profiles!faculty_assignments_student_id_fkey(
            id,
            full_name,
            email,
            student_id,
            department
          )
        `
        )
        .eq('faculty_id', profile.id);

      if (error) {
        setError(error);
        console.error('Error fetching assigned students:', error);
      } else {
        setAssignedStudents(data || []);
      }
    } catch (err) {
      setError(err);
      console.error('Error fetching assigned students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch student monitoring data
  const fetchMonitoringData = async (studentIds?: string[]) => {
    if (!profile || profile.role !== 'faculty') return;

    try {
      setLoading(true);
      let query = supabase.from('student_monitoring').select(`
          *,
          student:profiles!student_monitoring_student_id_fkey(
            id,
            full_name,
            email,
            student_id,
            department
          )
        `);

      if (studentIds && studentIds.length > 0) {
        query = query.in('student_id', studentIds);
      } else if (profile.faculty_level === 'basic') {
        // Basic faculty: only show assigned students
        const assignedStudentIds = assignedStudents.map(a => a.student_id);
        if (assignedStudentIds.length > 0) {
          query = query.in('student_id', assignedStudentIds);
        } else {
          setMonitoringData([]);
          setLoading(false);
          return;
        }
      }
      // senior/admin faculty see all

      const { data, error } = await query.order('last_updated', {
        ascending: false,
      });

      if (error) {
        setError(error);
        console.error('Error fetching monitoring data:', error);
      } else {
        setMonitoringData(data || []);
      }
    } catch (err) {
      setError(err);
      console.error('Error fetching monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add student monitoring data
  const addMonitoringData = async (data: {
    student_id: string;
    platform: string;
    platform_handle: string;
    solved_count?: number;
    contest_count?: number;
    rating?: number;
  }) => {
    try {
      const { error } = await supabase.from('student_monitoring').upsert(
        {
          ...data,
          last_updated: new Date().toISOString(),
        },
        {
          onConflict: 'student_id,platform,platform_handle',
        }
      );

      if (error) {
        setError(error);
        console.error('Error adding monitoring data:', error);
        return { error };
      }

      await fetchMonitoringData();
      return { error: null };
    } catch (err) {
      setError(err);
      console.error('Error adding monitoring data:', err);
      return { error: err };
    }
  };

  // Assign student to faculty
  const assignStudent = async (studentId: string) => {
    if (!profile || profile.role !== 'faculty')
      return { error: 'Not authorized' };

    try {
      const { error } = await supabase.from('faculty_assignments').insert({
        faculty_id: profile.id,
        student_id: studentId,
      });

      if (error) {
        setError(error);
        console.error('Error assigning student:', error);
        return { error };
      }

      await fetchAssignedStudents();
      return { error: null };
    } catch (err) {
      setError(err);
      console.error('Error assigning student:', err);
      return { error: err };
    }
  };

  // Unassign student from faculty
  const unassignStudent = async (studentId: string) => {
    if (!profile || profile.role !== 'faculty')
      return { error: 'Not authorized' };

    try {
      const { error } = await supabase
        .from('faculty_assignments')
        .delete()
        .eq('faculty_id', profile.id)
        .eq('student_id', studentId);

      if (error) {
        setError(error);
        console.error('Error unassigning student:', error);
        return { error };
      }

      await fetchAssignedStudents();
      return { error: null };
    } catch (err) {
      setError(err);
      console.error('Error unassigning student:', err);
      return { error: err };
    }
  };

  // Fetch all students (for faculty to browse and assign)
  const fetchAllStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, student_id, department, avatar_url')
        .eq('role', 'student')
        .order('full_name');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching all students:', err);
      return [];
    }
  };

  // Load data when profile changes
  useEffect(() => {
    if (profile && profile.role === 'faculty') {
      fetchAssignedStudents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  // Load monitoring data when assigned students change
  useEffect(() => {
    if (assignedStudents.length > 0) {
      const studentIds = assignedStudents.map(a => a.student_id);
      fetchMonitoringData(studentIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedStudents]);

  return {
    assignedStudents,
    monitoringData,
    loading,
    error,
    fetchAssignedStudents,
    fetchMonitoringData,
    addMonitoringData,
    assignStudent,
    unassignStudent,
    fetchAllStudents,
  };
};
