// API endpoint for webhook management
// This file handles webhook registration and management for LMS/ERP integration

import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

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
        await handleGetWebhooks(req, res);
        break;
      case 'POST':
        await handleCreateWebhook(req, res);
        break;
      case 'PUT':
        await handleUpdateWebhook(req, res);
        break;
      case 'DELETE':
        await handleDeleteWebhook(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleGetWebhooks(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (id) {
    // Get specific webhook
    const { data, error } = await supabase
      .from('webhooks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    return res.status(200).json(data);
  }

  // Get all webhooks
  const { data, error } = await supabase
    .from('webhooks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch webhooks' });
  }

  res.status(200).json({
    data: data,
    count: data.length,
  });
}

async function handleCreateWebhook(req: NextApiRequest, res: NextApiResponse) {
  const { url, events, secret, is_active = true } = req.body;

  // Validate required fields
  if (!url || !events || !Array.isArray(events)) {
    return res.status(400).json({
      error: 'Missing required fields: url, events (array)',
    });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({
      error: 'Invalid URL format',
    });
  }

  // Validate events
  const validEvents = [
    'student.created',
    'student.updated',
    'student.deleted',
    'course.created',
    'course.updated',
    'course.deleted',
    'achievement.earned',
    'achievement.verified',
    'achievement.rejected',
    'faculty.created',
    'faculty.updated',
    'faculty.assigned',
  ];

  const invalidEvents = events.filter(event => !validEvents.includes(event));
  if (invalidEvents.length > 0) {
    return res.status(400).json({
      error: `Invalid events: ${invalidEvents.join(', ')}`,
    });
  }

  try {
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        url,
        events,
        secret,
        is_active,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create webhook' });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdateWebhook(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Webhook ID is required' });
  }

  // Remove fields that shouldn't be updated
  delete updates.id;
  delete updates.created_at;

  // Add updated timestamp
  updates.updated_at = new Date().toISOString();

  try {
    const { data, error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update webhook' });
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('Error updating webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDeleteWebhook(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Webhook ID is required' });
  }

  try {
    const { error } = await supabase.from('webhooks').delete().eq('id', id);

    if (error) {
      return res.status(500).json({ error: 'Failed to delete webhook' });
    }

    res.status(204).end();
  } catch (error) {
    console.error('Error deleting webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
