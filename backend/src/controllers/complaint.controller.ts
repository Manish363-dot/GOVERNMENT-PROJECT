import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as complaintService from '../services/complaint.service';

/**
 * POST /api/complaints/send-otp
 * Public — sends verification OTP to citizen mobile.
 */
export async function sendOtp(req: Request, res: Response): Promise<void> {
  try {
    const { mobile } = req.body;
    const result = await complaintService.sendComplaintOtp(mobile);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to send OTP' });
  }
}

/**
 * POST /api/complaints
 * Public — citizens can submit complaints with verified OTP.
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const complaint = await complaintService.createComplaint(req.body);

    const io = req.app.get('io');
    if (io) {
      io.emit('complaint_update', { type: 'INSERT', new: complaint });
    }

    res.status(201).json({
      message: 'Complaint registered successfully',
      complaint_number: complaint.complaint_number,
      complaint,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to register complaint. Please try again.' });
  }
}

/**
 * GET /api/complaints
 * Authenticated — returns all complaints with optional status filter.
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const status = req.query.status as string | undefined;
    const complaints = await complaintService.getAllComplaints(status);
    res.json({ complaints });
  } catch (err: any) {
    console.error('Controller getAll error:', err);
    require('fs').writeFileSync('controller-getAll-error.log', String(err) + '\n' + err.stack);
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
}

/**
 * GET /api/complaints/:id
 * Authenticated — returns a single complaint with update history.
 */
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const result = await complaintService.getComplaintById(req.params.id);
    if (!result) {
      res.status(404).json({ error: 'Complaint not found' });
      return;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaint' });
  }
}

/**
 * GET /api/complaints/track/:trackingId
 * Public — citizens can track their complaint status by Complaint Number or Mobile.
 */
export async function track(req: Request, res: Response): Promise<void> {
  try {
    const { trackingId } = req.params;
    const result = await complaintService.trackComplaint(trackingId);
    if (!result) {
      res.status(404).json({ error: 'No complaint found matching the provided Complaint ID or Mobile number.' });
      return;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to track complaint' });
  }
}

/**
 * PUT /api/complaints/:id/status
 * Authenticated — updates complaint status.
 */
export async function updateStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, remark } = req.body;
    const complaint = await complaintService.updateComplaintStatus(
      req.params.id,
      status,
      remark || null,
      req.userId!
    );

    const io = req.app.get('io');
    if (io) {
      io.emit('complaint_update', { type: 'UPDATE', new: complaint });
    }

    res.json({ complaint });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to update complaint' });
  }
}

/**
 * GET /api/complaints/counts
 * Authenticated — returns complaint counts by status.
 */
export async function getCounts(req: Request, res: Response): Promise<void> {
  try {
    const counts = await complaintService.getComplaintCounts();
    res.json({ counts });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch complaint counts' });
  }
}
