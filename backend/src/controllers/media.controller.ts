import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

const prisma = new PrismaClient();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export const addBlogMedia = async (req: Request, res: Response) => {
  try {
    if (!(req as any).file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = ((req as any).file as any).location; // S3 URL provided by multer-s3
    const mime = (req as any).file.mimetype;
    let type = 'document';
    if (mime.startsWith('image/')) type = 'image';
    else if (mime.startsWith('video/')) type = 'video';

    const blogMedia = await prisma.blogMedia.create({
      data: {
        url,
        type,
      },
    });

    res.status(201).json(blogMedia);
  } catch (error) {
    console.error('Error adding blog media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBlogMedia = async (req: Request, res: Response) => {
  try {
    const media = await prisma.blogMedia.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json(media);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBlogMedia = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const media = await prisma.blogMedia.findUnique({ where: { id } });
    if (!media) return res.status(404).json({ error: 'Media not found' });

    // Extract S3 object key from URL
    const urlParts = media.url.split('/');
    const key = urlParts.slice(3).join('/'); // 'media/filename.ext'

    if (key && process.env.AWS_S3_BUCKET_NAME) {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
      }));
    }

    await prisma.blogMedia.delete({ where: { id } });
    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addDailyWork = async (req: Request, res: Response) => {
  try {
    const { date, description } = req.body;
    if (!(req as any).file) return res.status(400).json({ error: 'No file uploaded' });
    if (!date) return res.status(400).json({ error: 'Date is required' });

    const url = ((req as any).file as any).location;
    const mime = (req as any).file.mimetype;
    let type = 'document';
    if (mime.startsWith('image/')) type = 'image';
    else if (mime.startsWith('video/')) type = 'video';

    const dailyWork = await prisma.dailyWork.create({
      data: {
        url,
        type,
        date: new Date(date),
        description: description || null,
      },
    });

    res.status(201).json(dailyWork);
  } catch (error) {
    console.error('Error adding daily work:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getDailyWork = async (req: Request, res: Response) => {
  try {
    const works = await prisma.dailyWork.findMany({
      orderBy: { date: 'desc' },
    });
    res.json(works);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDailyWork = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const work = await prisma.dailyWork.findUnique({ where: { id } });
    if (!work) return res.status(404).json({ error: 'Work not found' });

    // Extract S3 object key from URL
    const urlParts = work.url.split('/');
    const key = urlParts.slice(3).join('/');

    if (key && process.env.AWS_S3_BUCKET_NAME) {
      await s3.send(new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
      }));
    }

    await prisma.dailyWork.delete({ where: { id } });
    res.json({ message: 'Work deleted successfully' });
  } catch (error) {
    console.error('Error deleting daily work:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
