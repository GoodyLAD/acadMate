// API endpoint for achievement management
// This file handles all achievement-related API requests for LMS/ERP integration

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
        await handleGetAchievements(req, res);
        break;
      case 'POST':
        await handleCreateAchievement(req, res);
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

async function handleGetAchievements(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { student_id, category, status, format } = req.query;

  if (!student_id) {
    return res.status(400).json({
      error: 'student_id parameter is required',
    });
  }

  const achievements = await lmsIntegrationService.getStudentAchievements(
    student_id as string
  );

  // Filter by category if specified
  let filteredAchievements = achievements;
  if (category) {
    filteredAchievements = achievements.filter(a => a.category === category);
  }

  // Filter by status if specified
  if (status) {
    filteredAchievements = filteredAchievements.filter(
      a => a.status === status
    );
  }

  // Handle different output formats
  if (format === 'csv') {
    const csv = convertToCSV(filteredAchievements);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="achievements.csv"'
    );
    return res.status(200).send(csv);
  }

  if (format === 'xml') {
    const xml = convertToXML(filteredAchievements, 'achievements');
    res.setHeader('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  }

  res.status(200).json({
    data: filteredAchievements,
    count: filteredAchievements.length,
    student_id: student_id,
    filters: { category, status },
  });
}

async function handleCreateAchievement(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const achievementData = req.body;

  // Validate required fields
  if (!achievementData.student_id || !achievementData.title) {
    return res.status(400).json({
      error: 'Missing required fields: student_id, title',
    });
  }

  // This would need to be implemented in the service
  // For now, return a placeholder response
  res.status(501).json({
    error: 'Achievement creation not yet implemented',
  });
}

// Helper functions
function convertToCSV(data: any[]): string {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => JSON.stringify(row[header] || '')).join(',')
    ),
  ].join('\n');

  return csvContent;
}

function convertToXML(data: any[], rootElement: string): string {
  const xml = data
    .map(item => {
      const entries = Object.entries(item)
        .map(([key, value]) => `  <${key}>${JSON.stringify(value)}</${key}>`)
        .join('\n');
      return `  <item>\n${entries}\n  </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n${xml}\n</${rootElement}>`;
}
