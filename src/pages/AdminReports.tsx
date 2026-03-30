import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Download,
  BarChart3,
  TrendingUp,
  Award,
  GraduationCap,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  Printer,
  Settings,
} from 'lucide-react';

interface ReportData {
  id: string;
  name: string;
  criteria: string;
  score: number;
  maxScore: number;
  status: 'excellent' | 'good' | 'average' | 'poor';
  lastUpdated: string;
  description: string;
}

interface ReportSection {
  id: string;
  title: string;
  weight: number;
  criteria: ReportData[];
  totalScore: number;
  maxTotalScore: number;
}

const AdminReports = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('nirf');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMainTab, setActiveMainTab] = useState('reports');

  const years = ['2024', '2023', '2022', '2021', '2020'];

  // NIRF Criteria Data
  const nirfCriteria: ReportSection[] = [
    {
      id: 'teaching-learning',
      title: 'Teaching, Learning & Resources (TLR)',
      weight: 30,
      criteria: [
        {
          id: 'tlr1',
          name: 'Student Strength including Doctoral Students',
          criteria: 'TLR1',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Total student enrollment including PhD students',
        },
        {
          id: 'tlr2',
          name: 'Faculty-Student Ratio with emphasis on permanent faculty',
          criteria: 'TLR2',
          score: 78,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Ratio of permanent faculty to students',
        },
        {
          id: 'tlr3',
          name: 'Combined metric for Faculty with PhD (or equivalent) and Experience',
          criteria: 'TLR3',
          score: 92,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Faculty qualifications and experience metrics',
        },
        {
          id: 'tlr4',
          name: 'Financial Resources and their Utilisation',
          criteria: 'TLR4',
          score: 88,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Budget allocation and utilization efficiency',
        },
      ],
      totalScore: 85.75,
      maxTotalScore: 100,
    },
    {
      id: 'research-professional',
      title: 'Research and Professional Practice (RP)',
      weight: 30,
      criteria: [
        {
          id: 'rp1',
          name: 'Combined metric for Publications',
          criteria: 'RP1',
          score: 76,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Research publications in indexed journals',
        },
        {
          id: 'rp2',
          name: 'Combined metric for Quality of Publications',
          criteria: 'RP2',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Quality metrics of research publications',
        },
        {
          id: 'rp3',
          name: 'IPR and Patents: Published, Granted, Filed',
          criteria: 'RP3',
          score: 68,
          maxScore: 100,
          status: 'average',
          lastUpdated: '2024-01-15',
          description: 'Intellectual Property Rights and patents',
        },
        {
          id: 'rp4',
          name: 'Footprint of Projects and Professional Practice',
          criteria: 'RP4',
          score: 74,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Research projects and professional practice',
        },
      ],
      totalScore: 75,
      maxTotalScore: 100,
    },
    {
      id: 'graduation-outcomes',
      title: 'Graduation Outcomes (GO)',
      weight: 20,
      criteria: [
        {
          id: 'go1',
          name: 'Combined metric for Placement and Higher Studies',
          criteria: 'GO1',
          score: 89,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Student placement and higher education outcomes',
        },
        {
          id: 'go2',
          name: 'Metric for University Examinations',
          criteria: 'GO2',
          score: 91,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Performance in university examinations',
        },
        {
          id: 'go3',
          name: 'Median Salary of Employed Graduates',
          criteria: 'GO3',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Median salary of employed graduates',
        },
      ],
      totalScore: 88.33,
      maxTotalScore: 100,
    },
    {
      id: 'outreach-diversity',
      title: 'Outreach and Inclusivity (OI)',
      weight: 10,
      criteria: [
        {
          id: 'oi1',
          name: 'Percentage of Students from other States/Countries',
          criteria: 'OI1',
          score: 72,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Geographic diversity of students',
        },
        {
          id: 'oi2',
          name: 'Percentage of Women',
          criteria: 'OI2',
          score: 45,
          maxScore: 100,
          status: 'poor',
          lastUpdated: '2024-01-15',
          description: 'Gender diversity in student body',
        },
        {
          id: 'oi3',
          name: 'Economically and Socially Challenged Students',
          criteria: 'OI3',
          score: 38,
          maxScore: 100,
          status: 'poor',
          lastUpdated: '2024-01-15',
          description: 'Inclusion of economically disadvantaged students',
        },
        {
          id: 'oi4',
          name: 'Facilities for Physically Challenged Students',
          criteria: 'OI4',
          score: 88,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Accessibility infrastructure and support',
        },
      ],
      totalScore: 60.75,
      maxTotalScore: 100,
    },
    {
      id: 'perception',
      title: 'Perception (PR)',
      weight: 10,
      criteria: [
        {
          id: 'pr1',
          name: 'Peer Perception: Academic Peers and Employers',
          criteria: 'PR1',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Perception among academic peers and employers',
        },
        {
          id: 'pr2',
          name: 'Public Perception',
          criteria: 'PR2',
          score: 76,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'General public perception and reputation',
        },
      ],
      totalScore: 79,
      maxTotalScore: 100,
    },
  ];

  // NAAC Criteria Data
  const naacCriteria: ReportSection[] = [
    {
      id: 'curricular-aspects',
      title: 'Curricular Aspects',
      weight: 15,
      criteria: [
        {
          id: 'ca1',
          name: 'Curriculum Design and Development',
          criteria: 'CA1',
          score: 88,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Curriculum design and development process',
        },
        {
          id: 'ca2',
          name: 'Academic Flexibility',
          criteria: 'CA2',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Flexibility in academic programs',
        },
        {
          id: 'ca3',
          name: 'Curriculum Enrichment',
          criteria: 'CA3',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Curriculum enrichment activities',
        },
        {
          id: 'ca4',
          name: 'Feedback System',
          criteria: 'CA4',
          score: 78,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Student feedback system implementation',
        },
      ],
      totalScore: 83.25,
      maxTotalScore: 100,
    },
    {
      id: 'teaching-learning-evaluation',
      title: 'Teaching-Learning and Evaluation',
      weight: 20,
      criteria: [
        {
          id: 'tle1',
          name: 'Student Enrolment and Profile',
          criteria: 'TLE1',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Student enrollment and profile analysis',
        },
        {
          id: 'tle2',
          name: 'Catering to Student Diversity',
          criteria: 'TLE2',
          score: 72,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Support for diverse student needs',
        },
        {
          id: 'tle3',
          name: 'Teaching-Learning Process',
          criteria: 'TLE3',
          score: 88,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Teaching-learning process effectiveness',
        },
        {
          id: 'tle4',
          name: 'Teacher Quality',
          criteria: 'TLE4',
          score: 91,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Faculty quality and qualifications',
        },
        {
          id: 'tle5',
          name: 'Evaluation Process and Reforms',
          criteria: 'TLE5',
          score: 79,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Evaluation process and reforms',
        },
      ],
      totalScore: 83,
      maxTotalScore: 100,
    },
    {
      id: 'research-consultancy',
      title: 'Research, Innovations and Extension',
      weight: 25,
      criteria: [
        {
          id: 'rie1',
          name: 'Promotion of Research and Facilities',
          criteria: 'RIE1',
          score: 76,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Research promotion and facilities',
        },
        {
          id: 'rie2',
          name: 'Resource Mobilization for Research',
          criteria: 'RIE2',
          score: 68,
          maxScore: 100,
          status: 'average',
          lastUpdated: '2024-01-15',
          description: 'Research funding and resource mobilization',
        },
        {
          id: 'rie3',
          name: 'Research Publications and Awards',
          criteria: 'RIE3',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Research publications and awards',
        },
        {
          id: 'rie4',
          name: 'Consultancy',
          criteria: 'RIE4',
          score: 74,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Consultancy services and projects',
        },
        {
          id: 'rie5',
          name: 'Extension Activities and Institutional Social Responsibility',
          criteria: 'RIE5',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Extension activities and social responsibility',
        },
      ],
      totalScore: 77,
      maxTotalScore: 100,
    },
    {
      id: 'infrastructure-learning',
      title: 'Infrastructure and Learning Resources',
      weight: 10,
      criteria: [
        {
          id: 'ilr1',
          name: 'Physical Facilities',
          criteria: 'ILR1',
          score: 88,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Physical infrastructure and facilities',
        },
        {
          id: 'ilr2',
          name: 'Library as a Learning Resource',
          criteria: 'ILR2',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Library resources and services',
        },
        {
          id: 'ilr3',
          name: 'IT Infrastructure',
          criteria: 'ILR3',
          score: 92,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Information technology infrastructure',
        },
        {
          id: 'ilr4',
          name: 'Maintenance of Campus Infrastructure',
          criteria: 'ILR4',
          score: 79,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Campus infrastructure maintenance',
        },
      ],
      totalScore: 86,
      maxTotalScore: 100,
    },
    {
      id: 'student-support',
      title: 'Student Support and Progression',
      weight: 15,
      criteria: [
        {
          id: 'ssp1',
          name: 'Student Mentoring and Support',
          criteria: 'SSP1',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Student mentoring and support systems',
        },
        {
          id: 'ssp2',
          name: 'Student Progression',
          criteria: 'SSP2',
          score: 88,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Student progression and success rates',
        },
        {
          id: 'ssp3',
          name: 'Student Participation and Activities',
          criteria: 'SSP3',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Student participation in activities',
        },
        {
          id: 'ssp4',
          name: 'Alumni Engagement',
          criteria: 'SSP4',
          score: 76,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Alumni engagement and networking',
        },
      ],
      totalScore: 82.75,
      maxTotalScore: 100,
    },
    {
      id: 'governance-leadership',
      title: 'Governance, Leadership and Management',
      weight: 10,
      criteria: [
        {
          id: 'glm1',
          name: 'Institutional Vision and Leadership',
          criteria: 'GLM1',
          score: 89,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Institutional vision and leadership quality',
        },
        {
          id: 'glm2',
          name: 'Strategy Development and Deployment',
          criteria: 'GLM2',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Strategic planning and deployment',
        },
        {
          id: 'glm3',
          name: 'Faculty Empowerment Strategies',
          criteria: 'GLM3',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Faculty empowerment and development',
        },
        {
          id: 'glm4',
          name: 'Financial Management and Resource Mobilization',
          criteria: 'GLM4',
          score: 78,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Financial management and resource mobilization',
        },
      ],
      totalScore: 83.5,
      maxTotalScore: 100,
    },
    {
      id: 'institutional-values',
      title: 'Institutional Values and Best Practices',
      weight: 5,
      criteria: [
        {
          id: 'ivbp1',
          name: 'Institutional Values and Social Responsibilities',
          criteria: 'IVBP1',
          score: 88,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Institutional values and social responsibility',
        },
        {
          id: 'ivbp2',
          name: 'Best Practices',
          criteria: 'IVBP2',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Implementation of best practices',
        },
      ],
      totalScore: 86.5,
      maxTotalScore: 100,
    },
  ];

  // AICTE Criteria Data
  const aicteCriteria: ReportSection[] = [
    {
      id: 'academic-excellence',
      title: 'Academic Excellence',
      weight: 25,
      criteria: [
        {
          id: 'ae1',
          name: 'Curriculum Design and Implementation',
          criteria: 'AE1',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Curriculum design and implementation quality',
        },
        {
          id: 'ae2',
          name: 'Faculty Quality and Development',
          criteria: 'AE2',
          score: 88,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Faculty qualifications and development programs',
        },
        {
          id: 'ae3',
          name: 'Student Learning Outcomes',
          criteria: 'AE3',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Student learning outcomes and assessment',
        },
        {
          id: 'ae4',
          name: 'Research and Innovation',
          criteria: 'AE4',
          score: 76,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Research activities and innovation initiatives',
        },
      ],
      totalScore: 82.75,
      maxTotalScore: 100,
    },
    {
      id: 'infrastructure-facilities',
      title: 'Infrastructure and Facilities',
      weight: 20,
      criteria: [
        {
          id: 'if1',
          name: 'Physical Infrastructure',
          criteria: 'IF1',
          score: 92,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Physical infrastructure and facilities',
        },
        {
          id: 'if2',
          name: 'Laboratory Facilities',
          criteria: 'IF2',
          score: 88,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Laboratory facilities and equipment',
        },
        {
          id: 'if3',
          name: 'Library and Learning Resources',
          criteria: 'IF3',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Library and learning resource facilities',
        },
        {
          id: 'if4',
          name: 'IT Infrastructure',
          criteria: 'IF4',
          score: 90,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Information technology infrastructure',
        },
      ],
      totalScore: 88.75,
      maxTotalScore: 100,
    },
    {
      id: 'student-support',
      title: 'Student Support and Development',
      weight: 20,
      criteria: [
        {
          id: 'ssd1',
          name: 'Student Mentoring and Counseling',
          criteria: 'SSD1',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Student mentoring and counseling services',
        },
        {
          id: 'ssd2',
          name: 'Placement and Career Services',
          criteria: 'SSD2',
          score: 89,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Placement and career development services',
        },
        {
          id: 'ssd3',
          name: 'Student Activities and Clubs',
          criteria: 'SSD3',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Student activities and club participation',
        },
        {
          id: 'ssd4',
          name: 'Scholarship and Financial Aid',
          criteria: 'SSD4',
          score: 78,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Scholarship and financial aid programs',
        },
      ],
      totalScore: 83.5,
      maxTotalScore: 100,
    },
    {
      id: 'industry-engagement',
      title: 'Industry Engagement and Collaboration',
      weight: 15,
      criteria: [
        {
          id: 'iec1',
          name: 'Industry Partnerships',
          criteria: 'IEC1',
          score: 76,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Industry partnerships and collaborations',
        },
        {
          id: 'iec2',
          name: 'Internship and Training Programs',
          criteria: 'IEC2',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Internship and training program quality',
        },
        {
          id: 'iec3',
          name: 'Industry Advisory Board',
          criteria: 'IEC3',
          score: 74,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Industry advisory board effectiveness',
        },
        {
          id: 'iec4',
          name: 'Consultancy and Sponsored Projects',
          criteria: 'IEC4',
          score: 68,
          maxScore: 100,
          status: 'average',
          lastUpdated: '2024-01-15',
          description: 'Consultancy and sponsored research projects',
        },
      ],
      totalScore: 75,
      maxTotalScore: 100,
    },
    {
      id: 'governance-management',
      title: 'Governance and Management',
      weight: 10,
      criteria: [
        {
          id: 'gm1',
          name: 'Leadership and Vision',
          criteria: 'GM1',
          score: 88,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Leadership quality and institutional vision',
        },
        {
          id: 'gm2',
          name: 'Financial Management',
          criteria: 'GM2',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Financial management and resource utilization',
        },
        {
          id: 'gm3',
          name: 'Quality Assurance',
          criteria: 'GM3',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Quality assurance mechanisms',
        },
        {
          id: 'gm4',
          name: 'Transparency and Accountability',
          criteria: 'GM4',
          score: 79,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Transparency and accountability measures',
        },
      ],
      totalScore: 83.5,
      maxTotalScore: 100,
    },
    {
      id: 'social-responsibility',
      title: 'Social Responsibility and Outreach',
      weight: 10,
      criteria: [
        {
          id: 'sro1',
          name: 'Community Engagement',
          criteria: 'SRO1',
          score: 85,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Community engagement activities',
        },
        {
          id: 'sro2',
          name: 'Environmental Sustainability',
          criteria: 'SRO2',
          score: 78,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Environmental sustainability initiatives',
        },
        {
          id: 'sro3',
          name: 'Social Impact Projects',
          criteria: 'SRO3',
          score: 82,
          maxScore: 100,
          status: 'excellent',
          lastUpdated: '2024-01-15',
          description: 'Social impact projects and initiatives',
        },
        {
          id: 'sro4',
          name: 'Inclusive Education',
          criteria: 'SRO4',
          score: 76,
          maxScore: 100,
          status: 'good',
          lastUpdated: '2024-01-15',
          description: 'Inclusive education practices',
        },
      ],
      totalScore: 80.25,
      maxTotalScore: 100,
    },
  ];

  useEffect(() => {
    loadReportData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedYear]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      let data: ReportSection[] = [];
      switch (activeTab) {
        case 'nirf':
          data = nirfCriteria;
          break;
        case 'naac':
          data = naacCriteria;
          break;
        case 'aicte':
          data = aicteCriteria;
          break;
        default:
          data = nirfCriteria;
      }

      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load report data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'average':
        return 'text-yellow-600 bg-yellow-100';
      case 'poor':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent':
        return <CheckCircle className='w-4 h-4' />;
      case 'good':
        return <TrendingUp className='w-4 h-4' />;
      case 'average':
        return <AlertCircle className='w-4 h-4' />;
      case 'poor':
        return <AlertCircle className='w-4 h-4' />;
      default:
        return <Clock className='w-4 h-4' />;
    }
  };

  const calculateOverallScore = () => {
    if (reportData.length === 0) return 0;

    const totalWeightedScore = reportData.reduce((sum, section) => {
      return sum + (section.totalScore * section.weight) / 100;
    }, 0);

    return Math.round(totalWeightedScore * 100) / 100;
  };

  const generateReport = async () => {
    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Success',
        description: 'Report generated successfully!',
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const exportReport = () => {
    toast({
      title: 'Export Started',
      description: 'Report export will begin shortly',
    });
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Institutional Reports
          </h1>
          <p className='text-gray-600 mt-2'>
            Generate comprehensive reports for NIRF, NAAC, and AICTE
            accreditation
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={loadReportData} variant='outline' disabled={loading}>
            <RefreshCw
              className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card className='border-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
        <CardContent className='p-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-2xl font-bold text-blue-900'>
                Overall Score: {calculateOverallScore()}/100
              </h3>
              <p className='text-blue-700 mt-1'>
                {activeTab.toUpperCase()} Accreditation Criteria -{' '}
                {selectedYear}
              </p>
            </div>
            <div className='flex gap-2'>
              <Button onClick={generateReport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Clock className='w-4 h-4 mr-2 animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className='w-4 h-4 mr-2' />
                    Generate Report
                  </>
                )}
              </Button>
              <Button variant='outline' onClick={exportReport}>
                <Download className='w-4 h-4 mr-2' />
                Export
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs
        value={activeMainTab}
        onValueChange={setActiveMainTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='reports'>Reports</TabsTrigger>
          <TabsTrigger value='criteria'>Accreditation Criteria</TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value='reports' className='space-y-6'>
          {/* Authority Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='nirf'>NIRF Rankings</TabsTrigger>
              <TabsTrigger value='naac'>NAAC Accreditation</TabsTrigger>
              <TabsTrigger value='aicte'>AICTE Standards</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className='space-y-6'>
              {loading ? (
                <div className='flex items-center justify-center py-12'>
                  <div className='text-center'>
                    <Clock className='w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin' />
                    <p className='text-gray-600'>Loading report data...</p>
                  </div>
                </div>
              ) : (
                <div className='space-y-6'>
                  {reportData.map(section => (
                    <Card
                      key={section.id}
                      className='border-0 bg-white/80 backdrop-blur-sm'
                    >
                      <CardHeader>
                        <div className='flex items-center justify-between'>
                          <CardTitle className='flex items-center gap-3'>
                            <div className='bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg'>
                              <BarChart3 className='h-5 w-5 text-white' />
                            </div>
                            {section.title}
                          </CardTitle>
                          <div className='text-right'>
                            <div className='text-2xl font-bold text-indigo-600'>
                              {section.totalScore}/{section.maxTotalScore}
                            </div>
                            <div className='text-sm text-gray-600'>
                              Weight: {section.weight}%
                            </div>
                          </div>
                        </div>
                        <Progress
                          value={section.totalScore}
                          className='h-2 mt-2'
                        />
                      </CardHeader>
                      <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          {section.criteria.map(criterion => (
                            <div
                              key={criterion.id}
                              className='p-4 border rounded-lg hover:shadow-md transition-shadow'
                            >
                              <div className='flex items-center justify-between mb-2'>
                                <h4 className='font-semibold text-sm'>
                                  {criterion.name}
                                </h4>
                                <Badge
                                  className={`text-xs ${getStatusColor(criterion.status)}`}
                                >
                                  {getStatusIcon(criterion.status)}
                                  <span className='ml-1 capitalize'>
                                    {criterion.status}
                                  </span>
                                </Badge>
                              </div>
                              <div className='flex items-center justify-between mb-2'>
                                <span className='text-xs text-gray-600'>
                                  {criterion.criteria}
                                </span>
                                <span className='text-sm font-medium'>
                                  {criterion.score}/{criterion.maxScore}
                                </span>
                              </div>
                              <Progress
                                value={criterion.score}
                                className='h-1 mb-2'
                              />
                              <p className='text-xs text-gray-600'>
                                {criterion.description}
                              </p>
                              <div className='flex items-center justify-between mt-2'>
                                <span className='text-xs text-gray-500'>
                                  Updated: {criterion.lastUpdated}
                                </span>
                                <div className='flex gap-1'>
                                  <Button
                                    size='sm'
                                    variant='ghost'
                                    className='h-6 w-6 p-0'
                                  >
                                    <Eye className='w-3 h-3' />
                                  </Button>
                                  <Button
                                    size='sm'
                                    variant='ghost'
                                    className='h-6 w-6 p-0'
                                  >
                                    <Printer className='w-3 h-3' />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Accreditation Criteria Tab */}
        <TabsContent value='criteria' className='space-y-6'>
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='text-2xl font-bold text-gray-900'>
                Accreditation Criteria & Mock Reports
              </h2>
              <p className='text-gray-600 mt-1'>
                Essential criteria and sample reports for upcoming accreditation
                submissions
              </p>
            </div>
            <Button
              onClick={() =>
                toast({
                  title: 'Info',
                  description:
                    'Use this checklist to prepare for accreditation',
                })
              }
            >
              <CheckCircle className='w-4 h-4 mr-2' />
              Preparation Checklist
            </Button>
          </div>

          {/* Mock Reports Section */}
          <Card className='border-0 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 text-xl text-gray-900'>
                <div className='bg-gradient-to-br from-gray-500 to-slate-600 p-2 rounded-lg'>
                  <FileText className='h-6 w-6 text-white' />
                </div>
                Sample Accreditation Reports
              </CardTitle>
              <p className='text-gray-700'>
                Mock reports showing the expected format and content for each
                accreditation body
              </p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* NIRF Mock Report */}
                <div className='p-4 bg-white/60 rounded-xl border'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Award className='w-5 h-5 text-blue-600' />
                    <h4 className='font-semibold text-gray-900'>
                      NIRF Ranking Report
                    </h4>
                  </div>
                  <div className='space-y-2 text-sm text-gray-600 mb-4'>
                    <div className='flex justify-between'>
                      <span>Overall Score:</span>
                      <span className='font-medium text-green-600'>
                        78.5/100
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Rank:</span>
                      <span className='font-medium'>45th Nationally</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Category:</span>
                      <span className='font-medium'>Engineering</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Year:</span>
                      <span className='font-medium'>2024</span>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Button size='sm' variant='outline' className='w-full'>
                      <Eye className='w-4 h-4 mr-2' />
                      View Sample Report
                    </Button>
                    <Button size='sm' variant='outline' className='w-full'>
                      <Download className='w-4 h-4 mr-2' />
                      Download Template
                    </Button>
                  </div>
                </div>

                {/* NAAC Mock Report */}
                <div className='p-4 bg-white/60 rounded-xl border'>
                  <div className='flex items-center gap-2 mb-3'>
                    <GraduationCap className='w-5 h-5 text-purple-600' />
                    <h4 className='font-semibold text-gray-900'>
                      NAAC Accreditation Report
                    </h4>
                  </div>
                  <div className='space-y-2 text-sm text-gray-600 mb-4'>
                    <div className='flex justify-between'>
                      <span>Grade:</span>
                      <span className='font-medium text-green-600'>A+</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>CGPA:</span>
                      <span className='font-medium'>3.65/4.0</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Cycle:</span>
                      <span className='font-medium'>Cycle 3</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Valid Until:</span>
                      <span className='font-medium'>2029</span>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Button size='sm' variant='outline' className='w-full'>
                      <Eye className='w-4 h-4 mr-2' />
                      View Sample Report
                    </Button>
                    <Button size='sm' variant='outline' className='w-full'>
                      <Download className='w-4 h-4 mr-2' />
                      Download Template
                    </Button>
                  </div>
                </div>

                {/* AICTE Mock Report */}
                <div className='p-4 bg-white/60 rounded-xl border'>
                  <div className='flex items-center gap-2 mb-3'>
                    <Settings className='w-5 h-5 text-red-600' />
                    <h4 className='font-semibold text-gray-900'>
                      AICTE Compliance Report
                    </h4>
                  </div>
                  <div className='space-y-2 text-sm text-gray-600 mb-4'>
                    <div className='flex justify-between'>
                      <span>Status:</span>
                      <span className='font-medium text-green-600'>
                        Compliant
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Score:</span>
                      <span className='font-medium'>85/100</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Category:</span>
                      <span className='font-medium'>Technical</span>
                    </div>
                    <div className='flex justify-between'>
                      <span>Year:</span>
                      <span className='font-medium'>2024-25</span>
                    </div>
                  </div>
                  <div className='space-y-2'>
                    <Button size='sm' variant='outline' className='w-full'>
                      <Eye className='w-4 h-4 mr-2' />
                      View Sample Report
                    </Button>
                    <Button size='sm' variant='outline' className='w-full'>
                      <Download className='w-4 h-4 mr-2' />
                      Download Template
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NIRF Criteria Requirements */}
          <Card className='border-0 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 text-xl text-blue-900'>
                <div className='bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg'>
                  <Award className='h-6 w-6 text-white' />
                </div>
                NIRF Ranking Requirements
              </CardTitle>
              <p className='text-blue-700'>
                Essential criteria for NIRF ranking submission
              </p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Teaching & Learning Resources
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Student enrollment data (UG, PG, PhD)</li>
                    <li>• Faculty-student ratio documentation</li>
                    <li>• Faculty qualifications (PhD percentage)</li>
                    <li>• Financial resource utilization reports</li>
                    <li>• Infrastructure and facilities audit</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Research & Professional Practice
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Research publications (last 3 years)</li>
                    <li>• Citation metrics and impact factors</li>
                    <li>• Patents filed and granted</li>
                    <li>• Sponsored research projects</li>
                    <li>• Industry collaboration records</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Graduation Outcomes
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Placement statistics and records</li>
                    <li>• Higher studies enrollment data</li>
                    <li>• University examination results</li>
                    <li>• Alumni salary surveys</li>
                    <li>• Student progression tracking</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Outreach & Inclusivity
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Geographic diversity of students</li>
                    <li>• Gender diversity statistics</li>
                    <li>• Economically disadvantaged student data</li>
                    <li>• Physically challenged student support</li>
                    <li>• Community outreach programs</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Perception
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Peer institution surveys</li>
                    <li>• Employer feedback reports</li>
                    <li>• Public perception surveys</li>
                    <li>• Media coverage analysis</li>
                    <li>• Social media sentiment</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Documentation Requirements
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Institutional profile documents</li>
                    <li>• Financial audit reports</li>
                    <li>• Academic calendar and policies</li>
                    <li>• Quality assurance reports</li>
                    <li>• Legal compliance certificates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* NAAC Criteria Requirements */}
          <Card className='border-0 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 text-xl text-purple-900'>
                <div className='bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg'>
                  <GraduationCap className='h-6 w-6 text-white' />
                </div>
                NAAC Accreditation Requirements
              </CardTitle>
              <p className='text-purple-700'>
                Comprehensive criteria for NAAC accreditation cycle
              </p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Curricular Aspects
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Curriculum design and development process</li>
                    <li>• Academic flexibility implementation</li>
                    <li>• Curriculum enrichment activities</li>
                    <li>• Student feedback system</li>
                    <li>• Industry relevance of curriculum</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Teaching-Learning & Evaluation
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Student enrollment and profile analysis</li>
                    <li>• Catering to student diversity</li>
                    <li>• Teaching-learning process documentation</li>
                    <li>• Teacher quality and development</li>
                    <li>• Evaluation process and reforms</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Research & Innovation
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Research promotion and facilities</li>
                    <li>• Resource mobilization for research</li>
                    <li>• Research publications and awards</li>
                    <li>• Consultancy services</li>
                    <li>• Extension activities and social responsibility</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Infrastructure & Learning Resources
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Physical facilities audit</li>
                    <li>• Library as learning resource</li>
                    <li>• IT infrastructure assessment</li>
                    <li>• Maintenance of campus infrastructure</li>
                    <li>• Safety and security measures</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Student Support & Progression
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Student mentoring and support systems</li>
                    <li>• Student progression tracking</li>
                    <li>• Student participation in activities</li>
                    <li>• Alumni engagement programs</li>
                    <li>• Career guidance and placement</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Governance & Management
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Institutional vision and leadership</li>
                    <li>• Strategy development and deployment</li>
                    <li>• Faculty empowerment strategies</li>
                    <li>• Financial management and resource mobilization</li>
                    <li>• Internal quality assurance system</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AICTE Criteria Requirements */}
          <Card className='border-0 bg-gradient-to-r from-red-50 to-orange-50 border-red-200'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 text-xl text-red-900'>
                <div className='bg-gradient-to-br from-red-500 to-orange-600 p-2 rounded-lg'>
                  <Settings className='h-6 w-6 text-white' />
                </div>
                AICTE Standards Requirements
              </CardTitle>
              <p className='text-red-700'>
                Technical education compliance standards
              </p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Academic Excellence
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Curriculum design and implementation</li>
                    <li>• Faculty quality and development</li>
                    <li>• Student learning outcomes</li>
                    <li>• Research and innovation initiatives</li>
                    <li>• Academic audit reports</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Infrastructure & Facilities
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Physical infrastructure compliance</li>
                    <li>• Laboratory facilities and equipment</li>
                    <li>• Library and learning resources</li>
                    <li>• IT infrastructure assessment</li>
                    <li>• Safety and security protocols</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Student Support & Development
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Student mentoring and counseling</li>
                    <li>• Placement and career services</li>
                    <li>• Student activities and clubs</li>
                    <li>• Scholarship and financial aid</li>
                    <li>• Student grievance redressal</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Industry Engagement
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Industry partnerships and collaborations</li>
                    <li>• Internship and training programs</li>
                    <li>• Industry advisory board</li>
                    <li>• Consultancy and sponsored projects</li>
                    <li>• Industry expert lectures</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Governance & Management
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Leadership and vision documentation</li>
                    <li>• Financial management reports</li>
                    <li>• Quality assurance mechanisms</li>
                    <li>• Transparency and accountability</li>
                    <li>• Policy implementation records</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl'>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Social Responsibility
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1'>
                    <li>• Community engagement activities</li>
                    <li>• Environmental sustainability initiatives</li>
                    <li>• Social impact projects</li>
                    <li>• Inclusive education practices</li>
                    <li>• Corporate social responsibility</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preparation Timeline */}
          <Card className='border-0 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'>
            <CardHeader>
              <CardTitle className='flex items-center gap-3 text-xl text-green-900'>
                <div className='bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg'>
                  <Calendar className='h-6 w-6 text-white' />
                </div>
                Accreditation Preparation Timeline
              </CardTitle>
              <p className='text-green-700'>
                Recommended timeline for accreditation preparation
              </p>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='p-4 bg-white/60 rounded-xl text-center'>
                  <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-blue-600 font-bold'>12</span>
                  </div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    12 Months Before
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1 text-left'>
                    <li>• Form accreditation committee</li>
                    <li>• Conduct self-assessment</li>
                    <li>• Identify gaps and weaknesses</li>
                    <li>• Develop action plan</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl text-center'>
                  <div className='w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-yellow-600 font-bold'>6</span>
                  </div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    6 Months Before
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1 text-left'>
                    <li>• Complete data collection</li>
                    <li>• Implement improvements</li>
                    <li>• Prepare documentation</li>
                    <li>• Conduct internal audit</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl text-center'>
                  <div className='w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-orange-600 font-bold'>3</span>
                  </div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    3 Months Before
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1 text-left'>
                    <li>• Finalize all documents</li>
                    <li>• Submit application</li>
                    <li>• Prepare for site visit</li>
                    <li>• Train staff and faculty</li>
                  </ul>
                </div>
                <div className='p-4 bg-white/60 rounded-xl text-center'>
                  <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-red-600 font-bold'>1</span>
                  </div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    1 Month Before
                  </h4>
                  <ul className='text-sm text-gray-600 space-y-1 text-left'>
                    <li>• Final preparations</li>
                    <li>• Mock site visits</li>
                    <li>• Staff briefings</li>
                    <li>• Last-minute checks</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
