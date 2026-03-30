// API endpoint for student management
// This file handles all student-related API requests for LMS/ERP integration

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
        await handleGetStudents(req, res);
        break;
      case 'POST':
        await handleCreateStudent(req, res);
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

async function handleGetStudents(req: NextApiRequest, res: NextApiResponse) {
  const { id, department, status, graduation_year, limit, offset, format } =
    req.query;

  // If specific student ID is requested
  if (id) {
    const student = await lmsIntegrationService.getStudent(id as string);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    return res.status(200).json(student);
  }

  // Get all students with filters
  const filters = {
    department: department as string,
    status: status as string,
    graduation_year: graduation_year
      ? parseInt(graduation_year as string)
      : undefined,
    limit: limit ? parseInt(limit as string) : undefined,
    offset: offset ? parseInt(offset as string) : undefined,
  };

  const students = await lmsIntegrationService.getStudents(filters);

  // Handle different output formats
  if (format === 'csv') {
    const csv = await lmsIntegrationService.exportStudents('csv');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
    return res.status(200).send(csv);
  }

  if (format === 'xml') {
    const xml = await lmsIntegrationService.exportStudents('xml');
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  }

  res.status(200).json({
    data: students,
    count: students.length,
    filters: filters,
  });
}

async function handleCreateStudent(req: NextApiRequest, res: NextApiResponse) {
  const studentData = req.body;

  // Validate required fields
  if (!studentData.full_name || !studentData.email) {
    return res.status(400).json({
      error: 'Missing required fields: full_name, email',
    });
  }

  const student = await lmsIntegrationService.createStudent(studentData);

  // Trigger webhook for student creation
  await lmsIntegrationService.triggerWebhook(
    'student.created',
    'student',
    student.id,
    student
  );

  res.status(201).json(student);
}
