// API endpoint for course management
// This file handles all course-related API requests for LMS/ERP integration

import { NextApiRequest, NextApiResponse } from 'next';
import { lmsIntegrationService } from '@/services/api/lmsIntegrationService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Authentication check
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.method) {
      case 'GET':
        await handleGetCourses(req, res);
        break;
      case 'POST':
        await handleCreateCourse(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetCourses(req: NextApiRequest, res: NextApiResponse) {
  const { id, faculty_id, semester, year, limit, offset, format } = req.query;

  // If specific course ID is requested
  if (id) {
    const course = await lmsIntegrationService.getCourse(id as string);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    return res.status(200).json(course);
  }

  // Get all courses with filters
  const filters = {
    faculty_id: faculty_id as string,
    semester: semester as string,
    year: year ? parseInt(year as string) : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    offset: offset ? parseInt(offset as string) : undefined,
  };

  const courses = await lmsIntegrationService.getCourses(filters);

  // Handle different output formats
  if (format === 'csv') {
    const csv = await lmsIntegrationService.exportCourses('csv');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="courses.csv"');
    return res.status(200).send(csv);
  }

  if (format === 'xml') {
    const xml = await lmsIntegrationService.exportCourses('xml');
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  }

  res.status(200).json({
    data: courses,
    count: courses.length,
    filters: filters,
  });
}

async function handleCreateCourse(req: NextApiRequest, res: NextApiResponse) {
  const courseData = req.body;

  // Validate required fields
  if (!courseData.course_code || !courseData.name || !courseData.faculty_id) {
    return res.status(400).json({
      error: 'Missing required fields: course_code, name, faculty_id',
    });
  }

  // This would need to be implemented in the service
  // For now, return a placeholder response
  res.status(501).json({
    error: 'Course creation not yet implemented',
  });
}
