import { Router, Request, Response } from 'express';

const router = Router();

// Root rental route (migrated from rental-platform/backend/src/server.ts)
router.get('/', (_req: Request, res: Response) => {
  res.send('🏛️ Zila Panchayat Almora — Online Rental Platform Backend API is running.');
});

// Health Check Endpoint (migrated from rental-platform/backend/src/server.ts)
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Zila Panchayat Almora — Online Rental Platform API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mock Quick Pay / Dues Search endpoint
router.get('/dues/search', (req: Request, res: Response) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // Simulated tenant dues response
  const sampleData = [
    {
      shopNo: 'SHOP-101',
      tenantName: 'रमेश चंद्र जोशी (Ramesh Chandra Joshi)',
      market: 'धारानौला मुख्य बाजार (Dharanaula Main Market)',
      monthlyRent: 4500,
      dueMonths: 2,
      totalDue: 9000,
      dueDate: '2026-11-05',
      status: 'pending'
    },
    {
      shopNo: 'SHOP-204',
      tenantName: 'सुरेश सिंह बिष्ट (Suresh Singh Bisht)',
      market: 'मॉल रोड बाजार अल्मोड़ा (Mall Road Almora)',
      monthlyRent: 6000,
      dueMonths: 0,
      totalDue: 0,
      dueDate: '2026-11-10',
      status: 'paid'
    }
  ];

  const matched = sampleData.filter(
    (item) =>
      item.shopNo.toLowerCase().includes(String(query).toLowerCase()) ||
      item.tenantName.toLowerCase().includes(String(query).toLowerCase())
  );

  return res.json({
    success: true,
    count: matched.length,
    data: matched.length > 0 ? matched : sampleData
  });
});

// Citizen Grievance & Feedback Submission for Rental
router.post('/feedback', (req: Request, res: Response) => {
  const { name, phone, shopNo, message } = req.body;
  
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone, and message are required' });
  }

  const ticketId = `RENTAL-${Date.now().toString().slice(-6)}`;

  return res.status(201).json({
    success: true,
    message: 'Feedback / Grievance recorded successfully',
    ticketId,
    timestamp: new Date().toISOString()
  });
});

export default router;
