import { prisma } from '../config/prisma';
import { Complaint } from '@prisma/client';

export async function createComplaint(complaint: {
  name: string;
  mobile: string;
  area: string;
  complaint_type: string;
  description?: string;
}) {
  try {
    const newComplaint = await prisma.complaint.create({
      data: {
        name: complaint.name,
        mobile: complaint.mobile,
        area: complaint.area,
        complaint_number: `COMP-${Date.now()}`,
        complaint_type: complaint.complaint_type as any,
        description: complaint.description || null,
        status: 'new' as any
      }
    });
    return newComplaint;
  } catch (error) {
    throw new Error('Failed to register complaint');
  }
}

export async function getAllComplaints(status?: string) {
  try {
    return await prisma.complaint.findMany({
      where: status && status !== 'all' ? { status: status as any } : undefined,
      orderBy: { created_at: 'desc' }
    });
  } catch (error) {
    throw new Error('Failed to fetch complaints');
  }
}

export async function getComplaintById(id: string) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        updates: {
          orderBy: { updated_at: 'desc' }
        }
      }
    });
    if (!complaint) return null;
    
    // Separate updates to match old structure slightly
    const { updates, ...complaintData } = complaint;
    return { complaint: complaintData, updates };
  } catch (error) {
    return null;
  }
}

export async function updateComplaintStatus(
  complaintId: string,
  status: string,
  remark: string | null,
  updatedBy: string
) {
  try {
    return await prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.update({
        where: { id: complaintId },
        data: { status: status as any }
      });

      await tx.complaintUpdate.create({
        data: {
          complaint_id: complaintId,
          status: status as any,
          remark,
          updated_by: updatedBy
        }
      });

      return complaint;
    });
  } catch (error) {
    throw new Error('Failed to update complaint');
  }
}

export async function getComplaintCounts() {
  try {
    const counts = await prisma.complaint.groupBy({
      by: ['status'],
      _count: true
    });

    let total = 0, newC = 0, in_progress = 0, resolved = 0;
    for (const c of counts) {
      total += c._count;
      if (c.status === 'new') newC = c._count;
      if (c.status === 'in_progress') in_progress = c._count;
      if (c.status === 'resolved') resolved = c._count;
    }

    return { total, new: newC, in_progress, resolved };
  } catch (error) {
    return { total: 0, new: 0, in_progress: 0, resolved: 0 };
  }
}

export async function getNewComplaintCount(): Promise<number> {
  try {
    return await prisma.complaint.count({
      where: { status: 'new' }
    });
  } catch (error) {
    return 0;
  }
}
