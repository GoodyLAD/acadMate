import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/utils/clearAuth';
import Index from './pages/Index';
import NotFound from './pages/NotFound';
import AuthPage from './components/auth/AuthPage';
import FacultyStudent from './pages/FacultyStudent';
import EventsPage from './pages/Events';
import EventDetail from './pages/EventDetail';
import EventRegistration from './pages/EventRegistration';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import AppLayout from './components/layout/AppLayout';
import CoursesPage from './pages/Courses';
import FacultySchedule from './pages/FacultySchedule';
import CommunityPage from './pages/Community';
import StudentGoals from './pages/StudentGoals';
import IntegrationsAnalytics from './pages/IntegrationsAnalytics';
import StudentRoute from './components/routing/StudentRoute';
import FacultyCommunity from './pages/FacultyCommunity';
import FacultyChatHub from './pages/FacultyChatHub';
import FacultyStudents from './pages/FacultyStudents';
import FacultyRoute from './components/routing/FacultyRoute';
import RecruiterLogin from './pages/RecruiterLogin';
import RecruiterDashboard from './pages/RecruiterDashboard';
import RecruiterStudentProfile from './pages/RecruiterStudentProfile';
import AdminRoute from './components/routing/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminFaculty from './pages/AdminFaculty';
import AdminAssignments from './pages/AdminAssignments';
import AdminDebug from './pages/AdminDebug';
import AdminIntegrations from './pages/AdminIntegrations';
import AdminApiTesting from './pages/AdminApiTesting';
import AdminReports from './pages/AdminReports';
import AcademicAchievements from './pages/AcademicAchievements';
import ResumeGenerator from './pages/ResumeGenerator';
import MyActivitiesPage from './pages/MyActivitesPage';
import MyProjectsPage from './pages/MyProjectsPage';
import GithubCallback from './pages/GithubCallback';
import GithubTest from './pages/GithubTest';
import CertificateManagement from './pages/CertificateManagement';
import Home from './pages/Home';
import StudentCourses from './pages/StudentCourses';
import VerifyCredentialPage from './pages/VerifyCredentialPage';
import { BlockchainProvider } from './contexts/BlockchainContext';
import ChatbotToggle from './components/ai/ChatbotToggle';

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BlockchainProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                {/* Public routes */}
                <Route path='/auth' element={<AuthPage />} />
                <Route path='/verify' element={<VerifyCredentialPage />} />
                <Route path='/github-callback' element={<GithubCallback />} />

                {/* Recruiter routes (own auth flow) */}
                <Route path='/recruiter/login' element={<RecruiterLogin />} />
                <Route
                  path='/recruiter/dashboard'
                  element={<RecruiterDashboard />}
                />
                <Route
                  path='/recruiter/student/:id'
                  element={<RecruiterStudentProfile />}
                />

                {/* Dashboard root – renders StudentDashboard or FacultyDashboard based on role */}
                <Route path='/' element={<Index />} />

                {/* ─── STUDENT ROUTES ──────────────────────────── */}
                <Route
                  path='/home'
                  element={
                    <StudentRoute>
                      <Home />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/profile'
                  element={
                    <StudentRoute>
                      <Profile />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/leaderboard'
                  element={
                    <StudentRoute>
                      <Leaderboard />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/events'
                  element={
                    <StudentRoute>
                      <EventsPage />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/events/:id'
                  element={
                    <StudentRoute>
                      <EventDetail />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/event-registration/:id'
                  element={
                    <StudentRoute>
                      <EventRegistration />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/community'
                  element={
                    <StudentRoute>
                      <CommunityPage />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/student/goals'
                  element={
                    <StudentRoute>
                      <StudentGoals />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/integrations'
                  element={
                    <StudentRoute>
                      <IntegrationsAnalytics />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/github-test'
                  element={
                    <StudentRoute>
                      <GithubTest />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/academic-achievements'
                  element={
                    <StudentRoute>
                      <AcademicAchievements />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/resume-generator'
                  element={
                    <StudentRoute>
                      <ResumeGenerator />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/my-projects'
                  element={
                    <StudentRoute>
                      <MyProjectsPage />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/my-activities'
                  element={
                    <StudentRoute>
                      <MyActivitiesPage />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/certificate-management'
                  element={
                    <StudentRoute>
                      <CertificateManagement />
                    </StudentRoute>
                  }
                />
                <Route
                  path='/student-courses'
                  element={
                    <StudentRoute>
                      <StudentCourses />
                    </StudentRoute>
                  }
                />

                {/* ─── FACULTY ROUTES ──────────────────────────── */}
                <Route
                  path='/courses'
                  element={
                    <FacultyRoute>
                      <CoursesPage />
                    </FacultyRoute>
                  }
                />
                <Route
                  path='/schedule'
                  element={
                    <FacultyRoute>
                      <FacultySchedule />
                    </FacultyRoute>
                  }
                />
                <Route
                  path='/faculty/students'
                  element={
                    <FacultyRoute>
                      <FacultyStudents />
                    </FacultyRoute>
                  }
                />
                <Route
                  path='/faculty/students/:id'
                  element={
                    <FacultyRoute>
                      <FacultyStudent />
                    </FacultyRoute>
                  }
                />
                <Route
                  path='/faculty/community'
                  element={
                    <FacultyRoute>
                      <FacultyCommunity />
                    </FacultyRoute>
                  }
                />
                <Route
                  path='/faculty/chat'
                  element={
                    <FacultyRoute>
                      <FacultyChatHub />
                    </FacultyRoute>
                  }
                />

                <Route path='*' element={<NotFound />} />
              </Route>

              {/* ─── ADMIN ROUTES (admin-level faculty only) ─── */}
              <Route
                path='/admin'
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path='faculty' element={<AdminFaculty />} />
                <Route path='assignments' element={<AdminAssignments />} />
                <Route path='integrations' element={<AdminIntegrations />} />
                <Route path='reports' element={<AdminReports />} />
                <Route path='api-testing' element={<AdminApiTesting />} />
                <Route path='debug' element={<AdminDebug />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <ChatbotToggle />
        </TooltipProvider>
      </BlockchainProvider>
    </QueryClientProvider>
  );
};

export default App;
