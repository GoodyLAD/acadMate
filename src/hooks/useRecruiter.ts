import { useState, useEffect } from 'react';

export interface Recruiter {
  id: string;
  recruiter_id: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
}

export const useRecruiter = () => {
  const [recruiter, setRecruiter] = useState<Recruiter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const recruiterId = localStorage.getItem('recruiter_id');
    if (recruiterId) {
      fetchRecruiter(recruiterId);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchRecruiter = async (recruiterId: string) => {
    try {
      setLoading(true);

      // Mock data for testing - replace with actual Supabase query once table is created
      const mockRecruiters = [
        {
          id: '1',
          recruiter_id: 'REC001',
          company_name: 'TechCorp Solutions',
          contact_person: 'John Smith',
          email: 'john.smith@techcorp.com',
          phone: '+91 98765 43210',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        },
        {
          id: '2',
          recruiter_id: 'REC002',
          company_name: 'InnovateLabs',
          contact_person: 'Sarah Johnson',
          email: 'sarah.johnson@innovatelabs.com',
          phone: '+91 98765 43211',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        },
        {
          id: '3',
          recruiter_id: 'REC003',
          company_name: 'StartupXYZ',
          contact_person: 'Mike Chen',
          email: 'mike.chen@startupxyz.com',
          phone: '+91 98765 43212',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        },
      ];

      const recruiter = mockRecruiters.find(
        r => r.recruiter_id === recruiterId
      );

      if (recruiter) {
        setRecruiter(recruiter);
      } else {
        setError(new Error('Recruiter not found'));
      }
    } catch (err) {
      setError(err);
      console.error('Error fetching recruiter:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (recruiterId: string) => {
    try {
      setLoading(true);

      // Mock data for testing - replace with actual Supabase query once table is created
      const mockRecruiters = [
        {
          id: '1',
          recruiter_id: 'REC001',
          company_name: 'TechCorp Solutions',
          contact_person: 'John Smith',
          email: 'john.smith@techcorp.com',
          phone: '+91 98765 43210',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        },
        {
          id: '2',
          recruiter_id: 'REC002',
          company_name: 'InnovateLabs',
          contact_person: 'Sarah Johnson',
          email: 'sarah.johnson@innovatelabs.com',
          phone: '+91 98765 43211',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        },
        {
          id: '3',
          recruiter_id: 'REC003',
          company_name: 'StartupXYZ',
          contact_person: 'Mike Chen',
          email: 'mike.chen@startupxyz.com',
          phone: '+91 98765 43212',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
        },
      ];

      const recruiter = mockRecruiters.find(
        r => r.recruiter_id === recruiterId
      );

      if (recruiter) {
        setRecruiter(recruiter);
        localStorage.setItem('recruiter_id', recruiterId);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid recruiter ID' };
      }
    } catch (err) {
      setError(err);
      return { success: false, error: 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setRecruiter(null);
    localStorage.removeItem('recruiter_id');
  };

  return {
    recruiter,
    loading,
    error,
    login,
    logout,
    refetch: () => recruiter && fetchRecruiter(recruiter.recruiter_id),
  };
};
