import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
} from 'recharts';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AcademicAchievements() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { signOut } = useAuth();
  const { profile } = useProfile();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isDarkMode, setIsDarkMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showNotificationsDropdown, setShowNotificationsDropdown] =
    useState(false);
  const [selectedSemester, setSelectedSemester] = useState<'sem1' | 'sem2'>(
    'sem1'
  );
  const [selectedSubject, setSelectedSubject] = useState<any | null>(null);
  const navigate = useNavigate();

  // Dummy Data
  const semesterData = {
    sem1: {
      mst1: [
        { subject: 'Mathematics-I', score: 18, total: 20 },
        { subject: 'Physics', score: 15, total: 20 },
        { subject: 'Chemistry', score: 16, total: 20 },
        { subject: 'Engineering Mechanics', score: 14, total: 20 },
        { subject: 'Programming in C', score: 17, total: 20 },
        { subject: 'Communication Skills', score: 19, total: 20 },
      ],
      mst2: [
        { subject: 'Mathematics-I', score: 17, total: 20 },
        { subject: 'Physics', score: 16, total: 20 },
        { subject: 'Chemistry', score: 18, total: 20 },
        { subject: 'Engineering Mechanics', score: 15, total: 20 },
        { subject: 'Programming in C', score: 18, total: 20 },
        { subject: 'Communication Skills', score: 20, total: 20 },
      ],
      est: [
        { subject: 'Mathematics-I', score: 88, total: 100 },
        { subject: 'Physics', score: 79, total: 100 },
        { subject: 'Chemistry', score: 82, total: 100 },
        { subject: 'Engineering Mechanics', score: 75, total: 100 },
        { subject: 'Programming in C', score: 85, total: 100 },
        { subject: 'Communication Skills', score: 90, total: 100 },
      ],
      practicals: [
        { subject: 'Physics Lab', score: 18, total: 20 },
        { subject: 'Chemistry Lab', score: 17, total: 20 },
        { subject: 'Programming Lab', score: 19, total: 20 },
        { subject: 'Communication Skills Lab', score: 18, total: 20 },
      ],
      attendance: [
        { subject: 'Mathematics-I', attended: 42, delivered: 48 },
        { subject: 'Physics', attended: 38, delivered: 45 },
        { subject: 'Chemistry', attended: 40, delivered: 46 },
        { subject: 'Engineering Mechanics', attended: 36, delivered: 44 },
        { subject: 'Programming in C', attended: 43, delivered: 48 },
        { subject: 'Communication Skills', attended: 45, delivered: 50 },
      ],
    },
    sem2: {
      mst1: [
        { subject: 'Mathematics-II', score: 19, total: 20 },
        { subject: 'Electrical Engineering', score: 18, total: 20 },
        { subject: 'Electronics Engineering', score: 17, total: 20 },
        { subject: 'Engineering Graphics', score: 16, total: 20 },
        { subject: 'Data Structures', score: 18, total: 20 },
        { subject: 'Environmental Studies', score: 20, total: 20 },
      ],
      mst2: [
        { subject: 'Mathematics-II', score: 20, total: 20 },
        { subject: 'Electrical Engineering', score: 19, total: 20 },
        { subject: 'Electronics Engineering', score: 18, total: 20 },
        { subject: 'Engineering Graphics', score: 17, total: 20 },
        { subject: 'Data Structures', score: 19, total: 20 },
        { subject: 'Environmental Studies', score: 20, total: 20 },
      ],
      est: [
        { subject: 'Mathematics-II', score: 92, total: 100 },
        { subject: 'Electrical Engineering', score: 85, total: 100 },
        { subject: 'Electronics Engineering', score: 83, total: 100 },
        { subject: 'Engineering Graphics', score: 78, total: 100 },
        { subject: 'Data Structures', score: 91, total: 100 },
        { subject: 'Environmental Studies', score: 88, total: 100 },
      ],
      practicals: [
        { subject: 'Electrical Lab', score: 19, total: 20 },
        { subject: 'Electronics Lab', score: 18, total: 20 },
        { subject: 'Data Structures Lab', score: 20, total: 20 },
        { subject: 'Engineering Graphics Lab', score: 19, total: 20 },
      ],
      attendance: [
        { subject: 'Mathematics-II', attended: 44, delivered: 50 },
        { subject: 'Electrical Engineering', attended: 39, delivered: 45 },
        { subject: 'Electronics Engineering', attended: 41, delivered: 46 },
        { subject: 'Engineering Graphics', attended: 37, delivered: 44 },
        { subject: 'Data Structures', attended: 47, delivered: 50 },
        { subject: 'Environmental Studies', attended: 49, delivered: 50 },
      ],
    },
  };

  function calculateCGPA(sgpaData: { sem: string; sgpa: number }[]): number {
    if (sgpaData.length === 0) return 0;
    const total = sgpaData.reduce((acc, cur) => acc + cur.sgpa, 0);
    return total / sgpaData.length;
  }

  const sgpaData = [
    { sem: 'Sem 1', sgpa: 7.2 },
    { sem: 'Sem 2', sgpa: 7.8 },
  ];

  const cgpa = calculateCGPA(sgpaData);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Attendance chart data
  const attendanceChart = semesterData[selectedSemester].attendance.map(d => ({
    subject: d.subject,
    percentage: Math.round((d.attended / d.delivered) * 100),
    ...d,
  }));

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDarkMode
          ? 'bg-gray-900 text-white'
          : 'bg-gradient-to-br from-slate-50 to-blue-50 text-slate-900'
      }`}
    >
      {/* 🔹 Top Navigation Bar */}

      <div className='p-6'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-8'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate('/')}
            className={`hover:bg-opacity-80 ${
              isDarkMode
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <ArrowLeft className='h-4 w-4' />
          </Button>
          <h1 className='text-3xl font-bold flex items-center gap-2'>
            <GraduationCap className='w-8 h-8 text-blue-500' />
            Academic Achievements
          </h1>
        </div>
        {/* 🔹 Semester Switcher */}
        <div className='flex justify-end mb-6'>
          <div className='inline-flex rounded-xl shadow-sm border bg-white dark:bg-gray-800'>
            <Button
              variant={selectedSemester === 'sem1' ? 'default' : 'ghost'}
              onClick={() => setSelectedSemester('sem1')}
              className={`rounded-l-xl px-4 py-2 ${
                selectedSemester === 'sem1'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Semester 1
            </Button>
            <Button
              variant={selectedSemester === 'sem2' ? 'default' : 'ghost'}
              onClick={() => setSelectedSemester('sem2')}
              className={`rounded-r-xl px-4 py-2 ${
                selectedSemester === 'sem2'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Semester 2
            </Button>
          </div>
        </div>

        {/* 🔹 Profile + SGPA Progress Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
          <Card className='shadow-lg rounded-2xl'>
            <CardHeader>
              <CardTitle>Student Profile</CardTitle>
            </CardHeader>
            <CardContent className='flex items-center justify-between'>
              {/* Profile Details (left side) */}
              <div className='space-y-2'>
                <p>
                  <span className='font-semibold'>Name:</span>{' '}
                  {profile?.fullName || 'N/A'}
                </p>
                <p>
                  <span className='font-semibold'>Roll No:</span>{' '}
                  {profile?.rollNo || 'N/A'}
                </p>
                <p>
                  <span className='font-semibold'>Branch:</span>{' '}
                  {profile?.branch || 'N/A'}
                </p>
                <p>
                  <span className='font-semibold'>Year:</span>{' '}
                  {profile?.year || 'N/A'}
                </p>
                <p>
                  <span className='font-semibold'>CGPA:</span> {cgpa.toFixed(2)}
                </p>
              </div>

              {/* Profile Image (right side rectangular box) */}
              <div className='w-32 h-40 rounded-xl overflow-hidden border shadow-md bg-gray-100 flex items-center justify-center '>
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt='Profile'
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-gray-500 text-xl font-semibold'>
                    {profile?.fullName
                      ? profile.fullName.charAt(0).toUpperCase()
                      : '?'}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SGPA Trend */}
          <Card className='shadow-lg rounded-2xl'>
            <CardHeader>
              <CardTitle>SGPA Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={250}>
                <LineChart data={sgpaData}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='sem' />
                  <YAxis domain={[6, 10]} />
                  <Tooltip />
                  <Line
                    type='monotone'
                    dataKey='sgpa'
                    stroke='#2563eb'
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 🔹 Subject-wise Dropdowns */}
        <Card className='mb-8 shadow-lg rounded-2xl'>
          <CardHeader>
            <CardTitle>Performance by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type='single' collapsible>
              {semesterData[selectedSemester].est.map(subject => (
                <AccordionItem key={subject.subject} value={subject.subject}>
                  <AccordionTrigger>{subject.subject}</AccordionTrigger>
                  <AccordionContent className='space-y-3'>
                    {/* MST1 */}
                    <p>
                      <span className='font-semibold'>MST 1:</span>{' '}
                      {semesterData[selectedSemester].mst1.find(
                        t => t.subject === subject.subject
                      )?.score ?? 'N/A'}{' '}
                      /{' '}
                      {semesterData[selectedSemester].mst1.find(
                        t => t.subject === subject.subject
                      )?.total ?? 'N/A'}
                    </p>

                    {/* MST2 */}
                    <p>
                      <span className='font-semibold'>MST 2:</span>{' '}
                      {semesterData[selectedSemester].mst2.find(
                        t => t.subject === subject.subject
                      )?.score ?? 'N/A'}{' '}
                      /{' '}
                      {semesterData[selectedSemester].mst2.find(
                        t => t.subject === subject.subject
                      )?.total ?? 'N/A'}
                    </p>

                    {/* Practical */}
                    <p>
                      <span className='font-semibold'>Practical:</span>{' '}
                      {semesterData[selectedSemester].practicals.find(t =>
                        t.subject.includes(subject.subject)
                      )?.score ?? 'N/A'}
                    </p>

                    {/* Assignments + Quizzes (dummy placeholders) */}
                    <p>
                      <span className='font-semibold'>Assignments:</span> 18 /
                      20
                    </p>
                    <p>
                      <span className='font-semibold'>Quizzes:</span> 9 / 10
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* 🔹 End Semester Table */}
        <Card className='mb-8 shadow-lg rounded-2xl'>
          <CardHeader>
            <CardTitle>End Semester Exams</CardTitle>
          </CardHeader>
          <CardContent>
            <table className='w-full border border-gray-200 dark:border-gray-700 rounded-lg'>
              <thead className='bg-gray-100 dark:bg-gray-800'>
                <tr>
                  <th className='p-2 text-left'>Subject</th>
                  <th className='p-2'>Marks</th>
                  <th className='p-2'>Grade</th>
                  <th className='p-2'>Credits</th>
                </tr>
              </thead>
              <tbody>
                {semesterData[selectedSemester].est.map(exam => {
                  const percent = Math.round((exam.score / exam.total) * 100);
                  const grade =
                    percent >= 90
                      ? 'A+'
                      : percent >= 80
                        ? 'A'
                        : percent >= 70
                          ? 'B'
                          : 'C';
                  const credits = exam.subject === 'Mathematics' ? 4 : 3; // dummy credit mapping
                  return (
                    <tr
                      key={exam.subject}
                      className='border-t dark:border-gray-700'
                    >
                      <td className='p-2'>{exam.subject}</td>
                      <td className='p-2'>
                        {exam.score}/{exam.total}
                      </td>
                      <td className='p-2'>{grade}</td>
                      <td className='p-2'>{credits}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* 🔹 Radar + Attendance Row */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-8'>
          {/* 🔹 Radar Chart */}
          <Card className='mb-8 shadow-lg rounded-2xl'>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={300}>
                <RadarChart
                  data={semesterData[selectedSemester].est.map(exam => ({
                    subject: exam.subject,
                    percentage: Math.round((exam.score / exam.total) * 100),
                  }))}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey='subject' />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name='Performance'
                    dataKey='percentage'
                    stroke='#2563eb'
                    fill='#2563eb'
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 🔹 Attendance Card (placed where CGPA card was earlier) */}
          <Card className='mb-6 shadow-lg rounded-2xl'>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width='100%' height={280}>
                <BarChart data={attendanceChart}>
                  <XAxis
                    dataKey='subject'
                    angle={-30}
                    textAnchor='end'
                    interval={0}
                    height={80}
                  />
                  <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={v => `${v}%`} />
                  <Bar
                    dataKey='percentage'
                    fill='#4f46e5'
                    radius={[6, 6, 0, 0]}
                    cursor='pointer'
                    onClick={(_, index) =>
                      setSelectedSubject(attendanceChart[index])
                    }
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendance Details Dialog */}
          <Dialog
            open={!!selectedSubject}
            onOpenChange={() => setSelectedSubject(null)}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedSubject?.subject} Attendance</DialogTitle>
              </DialogHeader>
              {selectedSubject && (
                <div className='space-y-2 text-sm'>
                  <p>
                    <span className='font-medium'>Classes Delivered:</span>{' '}
                    {selectedSubject.delivered}
                  </p>
                  <p>
                    <span className='font-medium'>Classes Attended:</span>{' '}
                    {selectedSubject.attended}
                  </p>
                  <p>
                    <span className='font-medium'>Leaves Taken:</span>{' '}
                    {selectedSubject.delivered - selectedSubject.attended}
                  </p>
                  <p>
                    <span className='font-medium'>Attendance %:</span>{' '}
                    {selectedSubject.percentage}%
                  </p>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
