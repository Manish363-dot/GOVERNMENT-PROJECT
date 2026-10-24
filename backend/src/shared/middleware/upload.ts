// @ts-ignore
import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

// AWS S3 Client setup
const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const allowedTypes = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 
  'video/mp4', 'video/webm', 'video/quicktime',
  'application/pdf',
  'application/msword', // doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'application/vnd.ms-excel', // xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
  'application/vnd.ms-powerpoint', // ppt
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
  'application/zip', 'application/x-zip-compressed'
];

const mediaFileFilter = (req: any, file: any, cb: any) => {
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, documents, and zips are allowed.'));
  }
};

const complaintAllowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'application/pdf'
];

const complaintFileFilter = (req: any, file: any, cb: any) => {
  if (complaintAllowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed for complaints.'));
  }
};

/**
 * Upload helper that receives file into memory, automatically converts & compresses images
 * to modern WebP (saving up to 80-90% bandwidth), sets long-term caching headers,
 * and uploads to AWS S3.
 */
function createOptimizedS3Uploader(
  folder: 'media' | 'complaints',
  fileFilter: any,
  maxSizeBytes: number
) {
  const memoryMulter = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxSizeBytes },
  });

  return {
    single: (fieldName: string) => [
      memoryMulter.single(fieldName),
      async (req: Request, res: Response, next: NextFunction) => {
        const file = (req as any).file;
        if (!file || !file.buffer) {
          return next();
        }

        try {
          const bucket = process.env.AWS_S3_BUCKET_NAME || 'zila-panchayat-images';
          const region = process.env.AWS_REGION || 'ap-south-1';
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

          let uploadBuffer: Buffer = file.buffer;
          let contentType: string = file.mimetype;
          let ext: string = path.extname(file.originalname);

          // If the uploaded file is an image, convert to high-efficiency WebP
          if (file.mimetype.startsWith('image/')) {
            try {
              uploadBuffer = await sharp(file.buffer)
                .rotate() // Auto-orient based on EXIF camera orientation
                .resize({
                  width: 1920,
                  height: 1920,
                  fit: 'inside',
                  withoutEnlargement: true,
                })
                .webp({ quality: 80, effort: 4 })
                .toBuffer();

              contentType = 'image/webp';
              ext = '.webp';
            } catch (sharpErr) {
              console.warn('[Sharp] Could not convert image to WebP, uploading original buffer:', sharpErr);
              // Graceful fallback to original image buffer
              uploadBuffer = file.buffer;
            }
          }

          const key = `${folder}/${uniqueSuffix}${ext}`;

          await s3.send(
            new PutObjectCommand({
              Bucket: bucket,
              Key: key,
              Body: uploadBuffer,
              ContentType: contentType,
              CacheControl: 'public, max-age=31536000, immutable',
            })
          );

          // Maintain exact same signature expected by controllers
          file.location = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
          file.key = key;
          file.size = uploadBuffer.length;
          file.mimetype = contentType;

          next();
        } catch (uploadErr) {
          console.error('[S3 Upload] Failed to upload file to S3:', uploadErr);
          next(uploadErr);
        }
      },
    ],
  };
}

export const uploadMedia = createOptimizedS3Uploader('media', mediaFileFilter, 50 * 1024 * 1024);
export const uploadComplaintAttachment = createOptimizedS3Uploader('complaints', complaintFileFilter, 10 * 1024 * 1024);
