import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChartTooltip } from '@/components/ui/chart';
import {
  Download,
  AlertTriangle,
  BarChart3,
  PieChart,
  LineChart,
} from 'lucide-react';
import {
  fetchLeetCodeData,
  fetchCodeforcesData,
  fetchCodewarsData,
  fetchPlaceholderData,
  fetchGFGData,
  fetchCodeChefData,
  fetchHackerEarthData,
  fetchHackerRankData,
} from '@/services/platforms';
import {
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart as RLineChart,
  Line,
  PieChart as RPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const PLATFORM_OPTIONS = [
  { key: 'leetcode', label: 'LeetCode' },
  { key: 'codeforces', label: 'Codeforces' },
  { key: 'codewars', label: 'Codewars' },
  { key: 'gfg', label: 'GFG' },
  { key: 'hackerrank', label: 'HackerRank' },
  { key: 'hackerearth', label: 'HackerEarth' },
  { key: 'codechef', label: 'CodeChef' },
];

interface Row {
  platform: string;
  studentId: string;
  gender: 'male' | 'female' | 'other';
  section?: string;
  klass?: string;
}

const MonitoringSection: React.FC = () => {
  const [selected, setSelected] = useState<string[]>(['leetcode']);
  const [rows, setRows] = useState<Row[]>([
    {
      platform: 'leetcode',
      studentId: '',
      gender: 'male',
      section: '',
      klass: '',
    },
  ]);
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStudent, setFilterStudent] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<
    'all' | 'male' | 'female' | 'other'
  >('all');
  const [sectionFilter, setSectionFilter] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('');
  const [topFilter, setTopFilter] = useState<
    'top10' | 'top25' | 'top50' | 'custom'
  >('top10');
  const [topCustom, setTopCustom] = useState<number>(10);
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [metricFilter, setMetricFilter] = useState<
    'solved' | 'contests' | 'rating'
  >('solved');

  // ⬇️ NEW: metrics + loading state + error handling
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleTogglePlatform = (key: string, checked: boolean) => {
    setSelected(prev =>
      checked ? [...new Set([...prev, key])] : prev.filter(p => p !== key)
    );
    setRows(prev => prev.map(r => (r.platform === key ? r : r)));
  };

  const addRow = () =>
    setRows(r => [
      ...r,
      {
        platform: selected[0] || 'leetcode',
        studentId: '',
        gender: 'male',
        section: '',
        klass: '',
      },
    ]);

  // ⬇️ ENHANCED: fetch metrics from APIs with better error handling
  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);

    const validRows = rows.filter(
      r => r.studentId.trim() && selected.includes(r.platform)
    );

    if (validRows.length === 0) {
      setError('Please add at least one student ID and select a platform');
      setLoading(false);
      return;
    }

    try {
      const results = await Promise.allSettled(
        validRows.map(async r => {
          let data;
          try {
            if (r.platform === 'leetcode') {
              data = await fetchLeetCodeData(r.studentId);
            } else if (r.platform === 'codeforces') {
              data = await fetchCodeforcesData(r.studentId);
            } else if (r.platform === 'codewars') {
              data = await fetchCodewarsData(r.studentId);
            } else if (r.platform === 'gfg') {
              data = await fetchGFGData(r.studentId);
            } else if (r.platform === 'hackerrank') {
              data = await fetchHackerRankData(r.studentId);
            } else if (r.platform === 'hackerearth') {
              data = await fetchHackerEarthData(r.studentId);
            } else if (r.platform === 'codechef') {
              data = await fetchCodeChefData(r.studentId);
            } else {
              data = await fetchPlaceholderData();
            }

            // Validate the data
            const validation = validateStudentData(
              data,
              r.platform,
              r.studentId
            );
            if (validation.errors.length > 0) {
              console.error(
                `Validation errors for ${r.studentId} on ${r.platform}:`,
                validation.errors
              );
            }
            if (validation.warnings.length > 0) {
              console.warn(
                `Validation warnings for ${r.studentId} on ${r.platform}:`,
                validation.warnings
              );
            }

            return {
              platform: r.platform,
              student: r.studentId,
              gender: r.gender,
              section: r.section || '',
              klass: r.klass || '',
              ...data,
              success: true,
              validationErrors: validation.errors,
              validationWarnings: validation.warnings,
            };
          } catch (platformError) {
            console.error(
              `Error fetching ${r.platform} data for ${r.studentId}:`,
              platformError
            );
            return {
              platform: r.platform,
              student: r.studentId,
              gender: r.gender,
              section: r.section || '',
              klass: r.klass || '',
              solved: 0,
              contests: 0,
              rating: 0,
              hours: 0,
              courses: 0,
              success: false,
              error:
                platformError instanceof Error
                  ? platformError.message
                  : 'Unknown error',
            };
          }
        })
      );

      const successfulResults = results
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === 'fulfilled'
        )
        .map(result => result.value);

      const failedResults = results
        .filter(
          (result): result is PromiseRejectedResult =>
            result.status === 'rejected'
        )
        .map(result => result.reason);

      setMetrics(successfulResults);
      setLastSync(new Date());

      if (failedResults.length > 0) {
        setError(
          `${failedResults.length} out of ${validRows.length} API calls failed. Check console for details.`
        );
      }

      // Show success message with validation info
      // Show validation warnings if any
      const allValidationErrors = successfulResults
        .filter(r => r.validationErrors && r.validationErrors.length > 0)
        .flatMap(r => r.validationErrors);

      const allValidationWarnings = successfulResults
        .filter(r => r.validationWarnings && r.validationWarnings.length > 0)
        .flatMap(r => r.validationWarnings);

      if (allValidationErrors.length > 0) {
        console.error('Data validation errors:', allValidationErrors);
      }

      if (allValidationWarnings.length > 0) {
        console.warn('Data validation warnings:', allValidationWarnings);
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch data from platforms'
      );
    } finally {
      setLoading(false);
    }
  };

  // ⬇️ UPDATED: submitIds triggers real fetch with auto-refresh
  const submitIds = () => {
    fetchMetrics();
  };

  // Auto-refresh functionality
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(300000); // 5 minutes default

  React.useEffect(() => {
    if (autoRefresh && metrics.length > 0) {
      const interval = setInterval(() => {
        fetchMetrics();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval, metrics.length]);

  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Enhanced data validation function with platform-specific rules
  const validateStudentData = (
    data: any,
    platform: string,
    studentId: string
  ) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validations
    if (data.solved < 0)
      errors.push(`Invalid solved count for ${studentId} on ${platform}`);
    if (data.contests < 0)
      errors.push(`Invalid contest count for ${studentId} on ${platform}`);
    if (data.rating < 0)
      errors.push(`Invalid rating for ${studentId} on ${platform}`);
    if (data.hours < 0)
      errors.push(`Invalid hours for ${studentId} on ${platform}`);

    // Platform-specific validations
    switch (platform) {
      case 'leetcode':
        if (data.solved > 3000)
          warnings.push(
            `Unusually high solved count for ${studentId} on LeetCode: ${data.solved}`
          );
        if (data.rating > 3000)
          warnings.push(
            `Unusually high rating for ${studentId} on LeetCode: ${data.rating}`
          );
        if (data.easySolved && data.mediumSolved && data.hardSolved) {
          const total = data.easySolved + data.mediumSolved + data.hardSolved;
          if (Math.abs(total - data.solved) > 10) {
            warnings.push(`Solved count mismatch for ${studentId} on LeetCode`);
          }
        }
        break;

      case 'codeforces':
        if (data.rating > 4000)
          warnings.push(
            `Unusually high rating for ${studentId} on Codeforces: ${data.rating}`
          );
        if (data.maxRating && data.rating > data.maxRating) {
          warnings.push(
            `Current rating higher than max rating for ${studentId} on Codeforces`
          );
        }
        break;

      case 'codewars':
        if (data.honor > 100000)
          warnings.push(
            `Unusually high honor for ${studentId} on Codewars: ${data.honor}`
          );
        if (data.rank < 0)
          warnings.push(
            `Invalid rank for ${studentId} on Codewars: ${data.rank}`
          );
        break;

      case 'gfg':
        if (data.codingScore > 10000)
          warnings.push(
            `Unusually high coding score for ${studentId} on GFG: ${data.codingScore}`
          );
        break;

      case 'hackerrank':
        if (data.level > 50)
          warnings.push(
            `Unusually high level for ${studentId} on HackerRank: ${data.level}`
          );
        break;

      case 'hackerearth':
        if (data.accuracy > 100)
          warnings.push(
            `Invalid accuracy for ${studentId} on HackerEarth: ${data.accuracy}`
          );
        break;

      case 'codechef':
        if (data.rating > 5000)
          warnings.push(
            `Unusually high rating for ${studentId} on CodeChef: ${data.rating}`
          );
        break;
    }

    return { errors, warnings };
  };

  // Enhanced success feedback
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getSuccessMessage = (successfulCount: number, totalCount: number) => {
    if (successfulCount === totalCount) {
      return `Successfully fetched data for all ${successfulCount} students`;
    } else if (successfulCount > 0) {
      return `Successfully fetched data for ${successfulCount} out of ${totalCount} students`;
    } else {
      return 'No data could be fetched from any platform';
    }
  };

  const studentsList = useMemo(
    () => Array.from(new Set(rows.map(r => r.studentId).filter(Boolean))),
    [rows]
  );

  // Filtering applied to real API data
  const filteredMetrics = useMemo(() => {
    const platforms = filterPlatform === 'all' ? selected : [filterPlatform];
    const base = metrics
      .filter(r => platforms.includes(r.platform))
      .filter(r => (genderFilter === 'all' ? true : r.gender === genderFilter))
      .filter(r =>
        sectionFilter
          ? (r.section || '')
              .toLowerCase()
              .includes(sectionFilter.toLowerCase())
          : true
      )
      .filter(r =>
        classFilter
          ? (r.klass || '').toLowerCase().includes(classFilter.toLowerCase())
          : true
      )
      .filter(r =>
        filterStudent === 'all' ? true : r.student === filterStudent
      );

    const items = base.map(r => ({
      platform: r.platform,
      student: r.studentId,
      uid: r.studentId,
      gender: r.gender,
      section: r.section || '',
      klass: r.klass || '',
      solved: r.solved || 0,
      contests: r.contests || 0,
      rating: r.rating || 0,
      hours: r.hours || 0,
      courses: r.courses || 0,
    }));

    const sorted = items.sort((a, b) => {
      if (metricFilter === 'solved') return b.solved - a.solved;
      if (metricFilter === 'contests') return b.contests - a.contests;
      return b.rating - a.rating;
    });

    const topN =
      topFilter === 'top10'
        ? 10
        : topFilter === 'top25'
          ? 25
          : topFilter === 'top50'
            ? 50
            : Math.max(1, topCustom);
    const sliced = sorted.slice(0, topN);

    return sliced.length
      ? sliced
      : [
          {
            platform: 'leetcode',
            student: 'demo',
            uid: 'demo',
            gender: 'male',
            section: '',
            klass: '',
            solved: 0,
            contests: 0,
            rating: 0,
            hours: 0,
            courses: 0,
          },
        ];
  }, [
    metrics,
    selected,
    filterPlatform,
    filterStudent,
    genderFilter,
    sectionFilter,
    classFilter,
    topFilter,
    topCustom,
    metricFilter,
  ]);

  const totals = useMemo(
    () => ({
      students: new Set(filteredMetrics.map(m => m.student)).size,
      activity: filteredMetrics.reduce(
        (s, m) => s + m.hours + m.solved + m.courses,
        0
      ),
      top: filteredMetrics.slice().sort((a, b) => b.solved - a.solved)[0],
    }),
    [filteredMetrics]
  );

  // Enhanced chart data with real platform statistics
  const barData = useMemo(() => {
    if (metricFilter === 'solved') {
      return filteredMetrics.map(m => ({
        name: m.student,
        value: m.solved,
        platform: m.platform,
        rating: m.rating,
      }));
    } else if (metricFilter === 'contests') {
      return filteredMetrics.map(m => ({
        name: m.student,
        value: m.contests,
        platform: m.platform,
        rating: m.rating,
      }));
    } else {
      return filteredMetrics.map(m => ({
        name: m.student,
        value: m.rating,
        platform: m.platform,
        solved: m.solved,
      }));
    }
  }, [filteredMetrics, metricFilter]);

  const lineData = useMemo(() => {
    // Create a timeline showing cumulative progress
    const sortedBySolved = [...filteredMetrics].sort(
      (a, b) => a.solved - b.solved
    );
    return sortedBySolved.map(m => ({
      student: m.student,
      solved: m.solved,
      contests: m.contests,
      rating: m.rating,
      hours: m.hours,
      platform: m.platform,
    }));
  }, [filteredMetrics]);

  const pieData = useMemo(() => {
    const byPlatform: Record<
      string,
      { solved: number; contests: number; rating: number; students: number }
    > = {};
    filteredMetrics.forEach(m => {
      if (!byPlatform[m.platform]) {
        byPlatform[m.platform] = {
          solved: 0,
          contests: 0,
          rating: 0,
          students: 0,
        };
      }
      byPlatform[m.platform].solved += m.solved;
      byPlatform[m.platform].contests += m.contests;
      byPlatform[m.platform].rating += m.rating;
      byPlatform[m.platform].students += 1;
    });

    if (metricFilter === 'solved') {
      return Object.entries(byPlatform).map(([name, data]) => ({
        name,
        value: data.solved,
        students: data.students,
        avgRating: data.rating / data.students,
      }));
    } else if (metricFilter === 'contests') {
      return Object.entries(byPlatform).map(([name, data]) => ({
        name,
        value: data.contests,
        students: data.students,
        avgRating: data.rating / data.students,
      }));
    } else {
      return Object.entries(byPlatform).map(([name, data]) => ({
        name,
        value: data.rating / data.students, // Average rating
        students: data.students,
        totalSolved: data.solved,
      }));
    }
  }, [filteredMetrics, metricFilter]);

  const COLORS = [
    '#7C3AED',
    '#10B981',
    '#F59E0B',
    '#60A5FA',
    '#F472B6',
    '#EF4444',
    '#14B8A6',
  ];

  // Platform color mapping - Purple theme with similar colors
  const PLATFORM_COLORS: Record<string, string> = {
    leetcode: '#7C3AED', // Purple (original)
    codeforces: '#8B5CF6', // Light purple
    codewars: '#A855F7', // Medium purple
    gfg: '#9333EA', // Deep purple
    hackerrank: '#C084FC', // Light purple
    hackerearth: '#6D28D9', // Dark purple
    codechef: '#581C87', // Very dark purple
  };

  // Function to get color for platform
  const getPlatformColor = (platform: string): string => {
    return PLATFORM_COLORS[platform] || COLORS[0];
  };

  const exportCSV = () => {
    // include uid and key metric fields
    const headers = [
      'uid',
      'platform',
      'student',
      'solved',
      'contests',
      'rating',
    ];
    const rowsCsv = metrics.map(m =>
      [
        m.uid || m.student,
        m.platform,
        m.student,
        m.solved ?? 0,
        m.contests ?? 0,
        typeof m.rating === 'number'
          ? (m.rating as number).toFixed(2)
          : (m.rating ?? ''),
      ].join(',')
    );
    const csv = [headers.join(','), ...rowsCsv].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${metricFilter}_${topFilter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const downloadTemplate = () => {
    const headers = ['platform', 'studentId', 'gender', 'section', 'class'];
    const sample = 'leetcode,student123,male,A,10';
    const csv = headers.join(',') + '\n' + sample + '\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ids-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const parseCSV = (text: string): Row[] => {
    const lines = text.split(/\r?\n/).filter(Boolean);
    if (!lines.length) return [];
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const idx = (name: string) => headers.indexOf(name);
    const pI = idx('platform');
    const sI = idx('studentid');
    const gI = idx('gender');
    const secI = idx('section');
    const cI = idx('class');
    const out: Row[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',');
      const platform = (cols[pI] || 'leetcode').trim();
      const studentId = (cols[sI] || '').trim();
      if (!studentId) continue;
      const gender = (cols[gI] || 'other').trim().toLowerCase() as
        | 'male'
        | 'female'
        | 'other';
      const section = (cols[secI] || '').trim();
      const klass = (cols[cI] || '').trim();
      out.push({ platform, studentId, gender, section, klass });
    }
    return out;
  };

  const mergeUniqueRows = (a: Row[], b: Row[]) => {
    const map = new Map<string, Row>();
    for (const r of [...a, ...b]) {
      const key = `${r.platform}|${r.studentId}`;
      if (!map.has(key)) map.set(key, r);
    }
    return Array.from(map.values());
  };

  const importCSVFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const parsed = parseCSV(text);
      if (parsed.length) {
        setRows(prev => mergeUniqueRows(prev, parsed));
      }
    };
    reader.readAsText(file);
  };

  const exportPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<pre>${JSON.stringify(metrics, null, 2)}</pre>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const inactive = metrics.every(
    m => (m.hours || 0) + (m.solved || 0) + (m.courses || 0) === 0
  );

  // Custom graphs state
  const [showAddGraph, setShowAddGraph] = useState(false);
  const [newGraphType, setNewGraphType] = useState<
    'pie' | 'bar' | 'line' | 'histogram' | 'scatter' | 'heatmap' | 'versus'
  >('bar');
  const [newGraphMetric, setNewGraphMetric] = useState<
    'solved' | 'contests' | 'rating'
  >('solved');
  const [newGraphXMetric, setNewGraphXMetric] = useState<
    'solved' | 'contests' | 'rating'
  >('solved');
  const [newGraphYMetric, setNewGraphYMetric] = useState<
    'solved' | 'contests' | 'rating'
  >('contests');
  const [heatmapBins, setHeatmapBins] = useState<number>(5);
  const [newGraphVersusMode, setNewGraphVersusMode] = useState<'xy' | 'group'>(
    'xy'
  );
  const [newGraphGroupBy, setNewGraphGroupBy] = useState<
    'gender' | 'section' | 'klass'
  >('gender');
  const [customGraphs, setCustomGraphs] = useState<
    Array<{
      id: string;
      type: string;
      metric?: string;
      xMetric?: string;
      yMetric?: string;
      mode?: string;
      groupBy?: string;
      title: string;
    }>
  >([]);

  const addGraph = () => {
    const id = String(Date.now());
    let title = '';
    if (newGraphType === 'versus') {
      if (newGraphVersusMode === 'group')
        title = `Compare by ${newGraphGroupBy} (${newGraphMetric})`;
      else title = `Versus ${newGraphXMetric} vs ${newGraphYMetric}`;
    } else if (newGraphType === 'scatter') {
      title = `Scatter ${newGraphXMetric} vs ${newGraphYMetric}`;
    } else {
      title = `${newGraphType.toUpperCase()} - ${newGraphMetric}`;
    }

    setCustomGraphs(g => [
      ...g,
      {
        id,
        type: newGraphType,
        metric: newGraphMetric,
        xMetric: newGraphXMetric,
        yMetric: newGraphYMetric,
        mode: newGraphVersusMode,
        groupBy: newGraphGroupBy,
        title,
      },
    ]);
    setShowAddGraph(false);
  };

  const removeGraph = (id: string) =>
    setCustomGraphs(g => g.filter(x => x.id !== id));

  // Export full card as image using html2canvas; fallback to SVG/foreignObject if html2canvas unavailable
  const loadHtml2Canvas = (): Promise<any> =>
    new Promise((resolve, reject) => {
      if ((window as any).html2canvas)
        return resolve((window as any).html2canvas);
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
      s.onload = () => resolve((window as any).html2canvas);
      s.onerror = () => reject(new Error('Failed to load html2canvas'));
      document.head.appendChild(s);
    });

  const exportGraphAsImage = async (idOrId: string) => {
    const container =
      document.getElementById(idOrId) ||
      document.getElementById(`custom-graph-${idOrId}`);
    if (!container) return alert('Graph element not found');

    // Try html2canvas first to capture full rendered card
    try {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        backgroundColor: getComputedStyle(container).backgroundColor || null,
      });
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `card-${idOrId}.png`;
      a.click();
      return;
    } catch (err) {
      console.warn(
        'html2canvas failed, falling back to SVG/foreignObject export',
        err
      );
    }

    // Fallback: try to pick the largest SVG inside the container (avoid icon svgs)
    const svgs = Array.from(container.querySelectorAll('svg')) as SVGElement[];
    let svg: SVGElement | null = null;
    if (svgs.length === 1) svg = svgs[0];
    else if (svgs.length > 1) {
      let maxArea = 0;
      for (const s of svgs) {
        const rect = (s as any).getBoundingClientRect
          ? (s as any).getBoundingClientRect()
          : {
              width: (s as any).clientWidth || 0,
              height: (s as any).clientHeight || 0,
            };
        const area = (rect.width || 0) * (rect.height || 0);
        if (area > maxArea) {
          maxArea = area;
          svg = s;
        }
      }
      if (svg && maxArea < 4000) {
        svg =
          svgs.find(
            s =>
              (s as any).classList && !(s as any).classList.contains('lucide')
          ) || svg;
      }
    }

    if (svg) {
      try {
        const serializer = new XMLSerializer();
        let svgStr = serializer.serializeToString(svg as SVGElement);
        if (!svgStr.match(/^<svg[^>]+xmlns=/)) {
          svgStr = svgStr.replace(
            /^<svg/,
            '<svg xmlns="http://www.w3.org/2000/svg"'
          );
        }
        const blob = new Blob([svgStr], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width || (svg as SVGElement).clientWidth || 800;
          canvas.height = img.height || (svg as SVGElement).clientHeight || 600;
          const ctx = canvas.getContext('2d');
          if (!ctx) return alert('Could not get canvas context');
          ctx.fillStyle =
            getComputedStyle(container).backgroundColor || '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          const a = document.createElement('a');
          a.href = canvas.toDataURL('image/png');
          a.download = `graph-${idOrId}.png`;
          a.click();
          URL.revokeObjectURL(url);
        };
        img.onerror = () => alert('Failed to export SVG as image');
        img.src = url;
        return;
      } catch (e) {
        console.error(e);
      }
    }

    // Final fallback: serialize container as foreignObject
    try {
      const width = container.offsetWidth || 800;
      const height = container.offsetHeight || 600;
      const serialized = new XMLSerializer().serializeToString(container);
      const svgWrap = `<?xml version="1.0" standalone="no"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'><foreignObject width='100%' height='100%'>${serialized}</foreignObject></svg>`;
      const blob = new Blob([svgWrap], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return alert('Could not get canvas context');
        ctx.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `card-${idOrId}.png`;
        a.click();
        URL.revokeObjectURL(url);
      };
      img.onerror = () => alert('Failed to export graph');
      img.src = url;
      return;
    } catch (e) {
      console.error(e);
      alert('Export not supported for this graph');
    }
  };

  const renderCustomGraph = (g: {
    id: string;
    type: string;
    metric?: string;
    xMetric?: string;
    yMetric?: string;
    mode?: string;
    groupBy?: string;
    title: string;
  }) => {
    if (g.type === 'pie') {
      // reuse pieData but map to metric value
      const data = pieData.map(p => ({ name: p.name, value: p.value }));
      return (
        <ResponsiveContainer width='100%' height={220}>
          <RPieChart>
            <Pie
              data={data}
              dataKey='value'
              nameKey='name'
              outerRadius={80}
              innerRadius={40}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getPlatformColor(entry.name)}
                />
              ))}
            </Pie>
          </RPieChart>
        </ResponsiveContainer>
      );
    }

    if (g.type === 'line') {
      return (
        <ResponsiveContainer width='100%' height={220}>
          <RLineChart data={lineData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='day' />
            <YAxis />
            <ChartTooltip />
            <Line
              type='monotone'
              dataKey={g.metric === 'rating' ? 'hours' : 'hours'}
              stroke='#10B981'
              strokeWidth={2}
              dot={false}
            />
          </RLineChart>
        </ResponsiveContainer>
      );
    }

    if (g.type === 'histogram') {
      // bin solved into ranges by platform
      const bins: Record<string, Record<string, number>> = {};
      const platforms = [...new Set(metrics.map(m => m.platform))];

      metrics.forEach(m => {
        const v = m.solved || 0;
        const bin = Math.floor(v / 10) * 10;
        const key = `${bin}-${bin + 9}`;

        if (!bins[key]) {
          bins[key] = {};
        }
        bins[key][m.platform] = (bins[key][m.platform] || 0) + 1;
      });

      const data = Object.entries(bins).map(([range, platformCounts]) => ({
        range,
        ...platformCounts,
      }));

      return (
        <ResponsiveContainer width='100%' height={220}>
          <RBarChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='range' />
            <YAxis />
            <ChartTooltip />
            {platforms.map((platform, index) => (
              <Bar
                key={platform}
                dataKey={platform}
                stackId='a'
                fill={getPlatformColor(platform)}
                radius={
                  index === platforms.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]
                }
              />
            ))}
          </RBarChart>
        </ResponsiveContainer>
      );
    }

    if (g.type === 'scatter' || (g.type === 'versus' && g.mode === 'xy')) {
      const xKey = (g.xMetric as 'solved' | 'contests' | 'rating') || 'solved';
      const yKey =
        (g.yMetric as 'solved' | 'contests' | 'rating') || 'contests';
      const data = metrics.map(m => ({
        x: m[xKey] ?? 0,
        y: m[yKey] ?? 0,
        name: m.student,
      }));
      return (
        <ResponsiveContainer width='100%' height={220}>
          <ScatterChart>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis type='number' dataKey='x' name={xKey} />
            <YAxis type='number' dataKey='y' name={yKey} />
            <ChartTooltip />
            <Scatter data={data} fill='#7C3AED' />
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    if (g.type === 'versus' && g.mode === 'group') {
      // aggregate metric by group (gender/section/klass)
      const groupKey = g.groupBy || 'gender';
      const metric = g.metric || 'solved';
      const map: Record<string, number> = {};
      metrics.forEach(m => {
        const k = (m as any)[groupKey] || 'unknown';
        map[k] = (map[k] || 0) + ((m as any)[metric] || 0);
      });
      const data = Object.entries(map).map(([k, v]) => ({
        group: k,
        value: v,
      }));
      return (
        <ResponsiveContainer width='100%' height={220}>
          <RBarChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray='3 3' />
            <XAxis dataKey='group' />
            <YAxis />
            <ChartTooltip />
            <Bar dataKey='value' fill='#7C3AED' radius={[6, 6, 0, 0]} />
          </RBarChart>
        </ResponsiveContainer>
      );
    }

    if (g.type === 'heatmap') {
      // build a simple grid heatmap from two metrics (x and y)
      const xKey = (g.xMetric as 'solved' | 'contests' | 'rating') || 'solved';
      const yKey =
        (g.yMetric as 'solved' | 'contests' | 'rating') || 'contests';
      const bins = heatmapBins || 5;
      const xVals = metrics.map(m => m[xKey] ?? 0);
      const yVals = metrics.map(m => m[yKey] ?? 0);
      const xMin = Math.min(...xVals, 0);
      const xMax = Math.max(...xVals, 1);
      const yMin = Math.min(...yVals, 0);
      const yMax = Math.max(...yVals, 1);
      const matrix: number[][] = Array.from({ length: bins }, () =>
        Array.from({ length: bins }, () => 0)
      );
      metrics.forEach(m => {
        const xv = m[xKey] ?? 0;
        const yv = m[yKey] ?? 0;
        const xi = Math.min(
          bins - 1,
          Math.floor(((xv - xMin) / (xMax - xMin || 1)) * bins)
        );
        const yi = Math.min(
          bins - 1,
          Math.floor(((yv - yMin) / (yMax - yMin || 1)) * bins)
        );
        matrix[yi][xi] = (matrix[yi][xi] || 0) + 1;
      });
      const maxCount = Math.max(...matrix.flat(), 1);
      const cells = [] as JSX.Element[];
      for (let r = bins - 1; r >= 0; r--) {
        for (let c = 0; c < bins; c++) {
          const v = matrix[r][c] || 0;
          const intensity = Math.round((v / maxCount) * 220);
          const color = `rgb(${255 - intensity}, ${230 - Math.round(intensity * 0.5)}, ${255})`;
          cells.push(
            <div
              key={`${r}-${c}`}
              style={{ background: color }}
              className='h-12 w-12 border'
            />
          );
        }
      }
      return (
        <div
          className='grid grid-cols-5 gap-1 p-2'
          style={{ gridTemplateColumns: `repeat(${bins}, minmax(0, 1fr))` }}
        >
          {cells}
        </div>
      );
    }

    // default bar chart (students solved)
    return (
      <ResponsiveContainer width='100%' height={220}>
        <RBarChart data={barData} margin={{ left: 8, right: 8 }}>
          <CartesianGrid strokeDasharray='3 3' />
          <XAxis dataKey='name' />
          <YAxis />
          <ChartTooltip />
          <Bar
            dataKey={g.metric === 'rating' ? 'rating' : 'solved'}
            radius={[6, 6, 0, 0]}
          >
            {barData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getPlatformColor(entry.platform)}
              />
            ))}
          </Bar>
        </RBarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Alerts */}
      {inactive && (
        <Alert>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Low activity</AlertTitle>
          <AlertDescription>
            No activity detected for the selected filters.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading Alert */}
      {loading && (
        <Alert>
          <div className='flex items-center gap-2'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
            <AlertTitle>Fetching data from platforms...</AlertTitle>
          </div>
          <AlertDescription>
            Please wait while we retrieve the latest statistics from the
            selected platforms.
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {!loading && !error && metrics.length > 0 && lastSync && (
        <Alert className='border-green-200 bg-green-50'>
          <div className='flex items-center gap-2'>
            <div className='h-4 w-4 rounded-full bg-green-500'></div>
            <AlertTitle>Data synced successfully</AlertTitle>
          </div>
          <AlertDescription>
            Last updated: {lastSync.toLocaleString()}. Showing data for{' '}
            {metrics.length} students.
          </AlertDescription>
        </Alert>
      )}

      {/* Platform Statistics Summary */}
      {!loading && !error && metrics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className='text-lg font-semibold'>
              Platform Statistics Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              {Object.entries(
                metrics.reduce(
                  (acc, m) => {
                    if (!acc[m.platform]) {
                      acc[m.platform] = {
                        students: 0,
                        totalSolved: 0,
                        totalContests: 0,
                        avgRating: 0,
                        totalHours: 0,
                      };
                    }
                    acc[m.platform].students += 1;
                    acc[m.platform].totalSolved += m.solved || 0;
                    acc[m.platform].totalContests += m.contests || 0;
                    acc[m.platform].totalHours += m.hours || 0;
                    acc[m.platform].avgRating += m.rating || 0;
                    return acc;
                  },
                  {} as Record<
                    string,
                    {
                      students: number;
                      totalSolved: number;
                      totalContests: number;
                      avgRating: number;
                      totalHours: number;
                    }
                  >
                )
              ).map(([platform, stats]) => {
                const typedStats = stats as {
                  students: number;
                  totalSolved: number;
                  totalContests: number;
                  avgRating: number;
                  totalHours: number;
                };
                return (
                  <div
                    key={platform}
                    className='p-4 border rounded-lg bg-gray-50'
                  >
                    <h3 className='font-semibold text-sm text-gray-700 mb-2 capitalize'>
                      {platform}
                    </h3>
                    <div className='space-y-1 text-xs'>
                      <div className='flex justify-between'>
                        <span>Students:</span>
                        <span className='font-medium'>
                          {typedStats.students}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Total Solved:</span>
                        <span className='font-medium'>
                          {typedStats.totalSolved}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Total Contests:</span>
                        <span className='font-medium'>
                          {typedStats.totalContests}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Avg Rating:</span>
                        <span className='font-medium'>
                          {(typedStats.avgRating / typedStats.students).toFixed(
                            1
                          )}
                        </span>
                      </div>
                      <div className='flex justify-between'>
                        <span>Total Hours:</span>
                        <span className='font-medium'>
                          {typedStats.totalHours}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className='text-xl font-bold'>
            Platform Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
            {PLATFORM_OPTIONS.map(opt => (
              <label
                key={opt.key}
                className='flex items-center gap-2 rounded-lg border p-3 hover:bg-gray-50'
              >
                <Checkbox
                  checked={selected.includes(opt.key)}
                  onCheckedChange={v =>
                    handleTogglePlatform(opt.key, Boolean(v))
                  }
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student IDs */}
      <Card>
        <CardHeader>
          <CardTitle className='text-xl font-bold'>Student IDs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='flex flex-wrap items-center gap-3 mb-4'>
            <input
              ref={fileInputRef}
              type='file'
              accept='.csv,text/csv'
              className='hidden'
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) importCSVFile(f);
                (e.target as HTMLInputElement).value = '';
              }}
            />
            <Button
              variant='outline'
              size='sm'
              onClick={() => fileInputRef.current?.click()}
            >
              Import IDs (CSV)
            </Button>
            <Button variant='outline' size='sm' onClick={downloadTemplate}>
              Template
            </Button>
            <Select
              value={filterPlatform}
              onValueChange={(v: string) => setFilterPlatform(v)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Platform' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Platforms</SelectItem>
                {selected.map(p => (
                  <SelectItem key={p} value={p}>
                    {PLATFORM_OPTIONS.find(o => o.key === p)?.label || p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterStudent}
              onValueChange={(v: string) => setFilterStudent(v)}
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Student' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Students</SelectItem>
                {studentsList.map(s => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={genderFilter}
              onValueChange={(v: 'all' | 'male' | 'female' | 'other') =>
                setGenderFilter(v)
              }
            >
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='Gender' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All</SelectItem>
                <SelectItem value='male'>Boy</SelectItem>
                <SelectItem value='female'>Girl</SelectItem>
                <SelectItem value='other'>Other</SelectItem>
              </SelectContent>
            </Select>

            <Input
              className='w-36'
              placeholder='Section'
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value)}
            />
            <Input
              className='w-36'
              placeholder='Class'
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
            />

            <Select
              value={topFilter}
              onValueChange={(v: 'top10' | 'top25' | 'top50' | 'custom') =>
                setTopFilter(v)
              }
            >
              <SelectTrigger className='w-40'>
                <SelectValue placeholder='Top' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='top10'>Top 10</SelectItem>
                <SelectItem value='top25'>Top 25</SelectItem>
                <SelectItem value='top50'>Top 50</SelectItem>
                <SelectItem value='custom'>Custom</SelectItem>
              </SelectContent>
            </Select>
            {topFilter === 'custom' && (
              <Input
                className='w-24'
                type='number'
                min={1}
                value={topCustom}
                onChange={e => setTopCustom(Number(e.target.value) || 1)}
              />
            )}

            <Select
              value={metricFilter}
              onValueChange={(v: 'solved' | 'contests' | 'rating') =>
                setMetricFilter(v)
              }
            >
              <SelectTrigger className='w-44'>
                <SelectValue placeholder='Metric' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='solved'>Problems Solved</SelectItem>
                <SelectItem value='contests'>Contests Given</SelectItem>
                <SelectItem value='rating'>Contest Rating</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={range}
              onValueChange={(v: '7d' | '30d' | '90d') => setRange(v)}
            >
              <SelectTrigger className='w-36'>
                <SelectValue placeholder='Range' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='7d'>Last 7 days</SelectItem>
                <SelectItem value='30d'>Last 30 days</SelectItem>
                <SelectItem value='90d'>Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <div className='ml-auto flex items-center gap-2'>
              <Button variant='outline' size='sm' onClick={exportCSV}>
                <Download className='h-4 w-4 mr-2' />
                Export CSV
              </Button>
              <Button variant='outline' size='sm' onClick={exportPDF}>
                <Download className='h-4 w-4 mr-2' />
                Export PDF
              </Button>
            </div>

            {/* Add Graph Dialog */}
            <Dialog open={showAddGraph} onOpenChange={setShowAddGraph}>
              <DialogContent className='sm:max-w-md'>
                <DialogHeader>
                  <DialogTitle>Add Custom Graph</DialogTitle>
                </DialogHeader>
                <div className='space-y-3'>
                  <div>
                    <label className='block text-sm text-gray-700 mb-1'>
                      Graph Type
                    </label>
                    <select
                      className='w-full rounded-md border px-3 py-2'
                      value={newGraphType}
                      onChange={e => setNewGraphType(e.target.value as any)}
                    >
                      <option value='bar'>Bar (by metric)</option>
                      <option value='pie'>Pie</option>
                      <option value='line'>Line</option>
                      <option value='histogram'>Histogram (binned)</option>
                      <option value='scatter'>Scatter Plot</option>
                      <option value='heatmap'>Heat Map</option>
                    </select>
                  </div>

                  <div>
                    <label className='block text-sm text-gray-700 mb-1'>
                      Metric
                    </label>
                    <select
                      className='w-full rounded-md border px-3 py-2'
                      value={newGraphMetric}
                      onChange={e => setNewGraphMetric(e.target.value as any)}
                    >
                      <option value='solved'>Problems Solved</option>
                      <option value='contests'>Contests Given</option>
                      <option value='rating'>Contest Rating</option>
                    </select>
                  </div>

                  {/* If the graph needs X/Y metrics */}
                  {(newGraphType === 'scatter' ||
                    newGraphType === 'versus' ||
                    newGraphType === 'heatmap') && (
                    <div>
                      {/* For versus, allow group mode */}
                      {newGraphType === 'versus' && (
                        <div className='mb-2'>
                          <label className='block text-sm text-gray-700 mb-1'>
                            Versus Mode
                          </label>
                          <select
                            className='w-full rounded-md border px-3 py-2'
                            value={newGraphVersusMode}
                            onChange={e =>
                              setNewGraphVersusMode(e.target.value as any)
                            }
                          >
                            <option value='xy'>X vs Y (numeric)</option>
                            <option value='group'>
                              Group comparison (categorical)
                            </option>
                          </select>
                        </div>
                      )}

                      <label className='block text-sm text-gray-700 mb-1'>
                        X Metric
                      </label>
                      <select
                        className='w-full rounded-md border px-3 py-2 mb-2'
                        value={newGraphXMetric}
                        onChange={e =>
                          setNewGraphXMetric(e.target.value as any)
                        }
                      >
                        <option value='solved'>Problems Solved</option>
                        <option value='contests'>Contests Given</option>
                        <option value='rating'>Contest Rating</option>
                      </select>

                      <label className='block text-sm text-gray-700 mb-1'>
                        Y Metric
                      </label>
                      <select
                        className='w-full rounded-md border px-3 py-2'
                        value={newGraphYMetric}
                        onChange={e =>
                          setNewGraphYMetric(e.target.value as any)
                        }
                      >
                        <option value='solved'>Problems Solved</option>
                        <option value='contests'>Contests Given</option>
                        <option value='rating'>Contest Rating</option>
                      </select>

                      {newGraphType === 'heatmap' && (
                        <div className='mt-2'>
                          <label className='block text-sm text-gray-700 mb-1'>
                            Bins
                          </label>
                          <input
                            type='number'
                            min={2}
                            max={10}
                            value={heatmapBins}
                            onChange={e =>
                              setHeatmapBins(Number(e.target.value) || 5)
                            }
                            className='w-24 rounded-md border px-3 py-2'
                          />
                        </div>
                      )}

                      {newGraphType === 'versus' &&
                        newGraphVersusMode === 'group' && (
                          <div className='mt-3'>
                            <label className='block text-sm text-gray-700 mb-1'>
                              Group by
                            </label>
                            <select
                              className='w-full rounded-md border px-3 py-2'
                              value={newGraphGroupBy}
                              onChange={e =>
                                setNewGraphGroupBy(e.target.value as any)
                              }
                            >
                              <option value='gender'>Gender</option>
                              <option value='section'>Section</option>
                              <option value='klass'>Class</option>
                            </select>
                            <div className='text-xs text-gray-500 mt-1'>
                              This will aggregate the selected metric across
                              groups (sum).
                            </div>
                          </div>
                        )}
                    </div>
                  )}

                  <div className='flex justify-end gap-2'>
                    <Button
                      variant='outline'
                      onClick={() => setShowAddGraph(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={addGraph}>Add</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className='grid grid-cols-1 gap-3'>
            {rows.map((row, idx) => (
              <div
                key={idx}
                className='grid grid-cols-1 md:grid-cols-6 gap-3 items-center'
              >
                <Select
                  value={row.platform}
                  onValueChange={v =>
                    setRows(r =>
                      r.map((x, i) => (i === idx ? { ...x, platform: v } : x))
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selected.map(p => (
                      <SelectItem key={p} value={p}>
                        {PLATFORM_OPTIONS.find(o => o.key === p)?.label || p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder='Student ID / Handle'
                  value={row.studentId}
                  onChange={e =>
                    setRows(r =>
                      r.map((x, i) =>
                        i === idx ? { ...x, studentId: e.target.value } : x
                      )
                    )
                  }
                />
                <Select
                  value={row.gender}
                  onValueChange={(v: 'male' | 'female' | 'other') =>
                    setRows(r =>
                      r.map((x, i) => (i === idx ? { ...x, gender: v } : x))
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Gender' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='male'>Boy</SelectItem>
                    <SelectItem value='female'>Girl</SelectItem>
                    <SelectItem value='other'>Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder='Section'
                  value={row.section}
                  onChange={e =>
                    setRows(r =>
                      r.map((x, i) =>
                        i === idx ? { ...x, section: e.target.value } : x
                      )
                    )
                  }
                />
                <Input
                  placeholder='Class'
                  value={row.klass}
                  onChange={e =>
                    setRows(r =>
                      r.map((x, i) =>
                        i === idx ? { ...x, klass: e.target.value } : x
                      )
                    )
                  }
                />
                <div className='flex gap-2'>
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => setRows(r => r.filter((_, i) => i !== idx))}
                  >
                    Remove
                  </Button>
                  {idx === rows.length - 1 && (
                    <Button className='w-full' onClick={addRow}>
                      Add Row
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {rows.length === 0 && (
              <Button variant='outline' onClick={addRow}>
                Add Row
              </Button>
            )}
          </div>

          <div className='mt-4 flex justify-between items-center'>
            <div className='flex items-center gap-4'>
              <label className='flex items-center gap-2'>
                <input
                  type='checkbox'
                  checked={autoRefresh}
                  onChange={toggleAutoRefresh}
                  className='rounded'
                />
                <span className='text-sm'>Auto-refresh</span>
              </label>
              {autoRefresh && (
                <select
                  value={refreshInterval}
                  onChange={e => setRefreshInterval(Number(e.target.value))}
                  className='text-sm border rounded px-2 py-1'
                >
                  <option value={60000}>1 minute</option>
                  <option value={300000}>5 minutes</option>
                  <option value={600000}>10 minutes</option>
                  <option value={1800000}>30 minutes</option>
                </select>
              )}
            </div>
            <div className='flex items-center gap-2'>
              {lastSync && (
                <span className='text-sm text-gray-500'>
                  Last sync: {lastSync.toLocaleTimeString()}
                </span>
              )}
              <Button
                onClick={submitIds}
                disabled={loading}
                className='min-w-[100px]'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Fetching...
                  </>
                ) : (
                  'Fetch Data'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Graph and Versus buttons (separate) */}
      <div className='flex justify-end mb-4'>
        <Button
          className='mr-2'
          onClick={() => {
            setNewGraphType('versus');
            setNewGraphVersusMode('group');
            setShowAddGraph(true);
          }}
        >
          Versus Graph
        </Button>
        <Button
          onClick={() => {
            setNewGraphType('bar');
            setShowAddGraph(true);
          }}
        >
          Add Graph
        </Button>
      </div>

      {/* Dashboard placeholders */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        <Card id='graph-problems'>
          <CardHeader>
            <div className='flex items-center justify-between w-full'>
              <CardTitle className='flex items-center gap-2'>
                <BarChart3 className='h-4 w-4' /> Problems Solved
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => exportGraphAsImage('graph-problems')}
                  title='Download chart'
                >
                  <Download className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <RBarChart data={barData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='name' />
                  <YAxis />
                  <ChartTooltip />
                  <Bar dataKey='value' radius={[6, 6, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getPlatformColor(entry.platform)}
                      />
                    ))}
                  </Bar>
                </RBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card id='graph-time'>
          <CardHeader>
            <div className='flex items-center justify-between w-full'>
              <CardTitle className='flex items-center gap-2'>
                <LineChart className='h-4 w-4' /> Time Spent
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => exportGraphAsImage('graph-time')}
                  title='Download chart'
                >
                  <Download className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <RLineChart data={lineData} margin={{ left: 8, right: 8 }}>
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='day' />
                  <YAxis />
                  <ChartTooltip />
                  <Line
                    type='monotone'
                    dataKey={
                      metricFilter === 'solved'
                        ? 'solved'
                        : metricFilter === 'contests'
                          ? 'contests'
                          : 'rating'
                    }
                    stroke='#10B981'
                    strokeWidth={2}
                    dot={false}
                  />
                </RLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card id='graph-platform'>
          <CardHeader>
            <div className='flex items-center justify-between w-full'>
              <CardTitle className='flex items-center gap-2'>
                <PieChart className='h-4 w-4' /> Platform Share
              </CardTitle>
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => exportGraphAsImage('graph-platform')}
                  title='Download chart'
                >
                  <Download className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <RPieChart>
                  <Pie
                    data={pieData}
                    dataKey='value'
                    nameKey='name'
                    outerRadius={80}
                    innerRadius={40}
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getPlatformColor(entry.name)}
                      />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </RPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom graphs added by user */}
      {customGraphs.length > 0 && (
        <div className='mt-6'>
          <h3 className='text-lg font-semibold mb-4'>Custom Graphs</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {customGraphs.map(g => (
              <Card key={g.id} id={`custom-graph-${g.id}`}>
                <CardHeader>
                  <div className='flex items-center justify-between w-full'>
                    <CardTitle className='text-sm font-medium'>
                      {g.title}
                    </CardTitle>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => exportGraphAsImage(g.id)}
                        title='Download graph'
                        aria-label={`Download graph ${g.id}`}
                      >
                        <Download className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => removeGraph(g.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>{renderCustomGraph(g)}</CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totals.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totals.activity}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Performer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {totals.top ? `${totals.top.student}` : '—'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MonitoringSection;
