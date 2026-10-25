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
export const rentalDocAllowedMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'image/webp',
  'application/pdf',
];

const rentalDocFileFilter = (req: any, file: any, cb: any) => {
  if (rentalDocAllowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, PNG, and WEBP documents are allowed.'));
  }
};

const profilePhotoFileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Profile picture must be an image (JPG, PNG, WEBP).'));
  }
};

/**
 * Upload helper that receives file into memory, automatically converts & compresses images
 * to modern WebP (saving up to 80-90% bandwidth), sets long-term caching headers,
 * and uploads to AWS S3.
 */
function createOptimizedS3Uploader(
  folder: string,
  fileFilter: any,
  maxSizeBytes: number
) {
  const memoryMulter = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: maxSizeBytes },
  });

  const processAndUploadFile = async (file: any, targetFolder: string) => {
    if (!file || !file.buffer) return;

    const bucket = process.env.AWS_S3_BUCKET_NAME || 'zila-panchayat-images';
    const region = process.env.AWS_REGION || 'ap-south-1';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);

    let uploadBuffer: Buffer = file.buffer;
    let contentType: string = file.mimetype;
    let ext: string = path.extname(file.originalname);

    // Any image uploaded (JPG, PNG, GIF, BMP, TIFF, HEIC, etc.) is automatically converted to WebP
    const isImage =
      (file.mimetype && file.mimetype.startsWith('image/')) ||
      /\.(jpe?g|png|webp|gif|bmp|tiff?|heic|heif|avif|jfif)$/i.test(file.originalname);

    if (isImage) {
      try {
        uploadBuffer = await sharp(file.buffer)
          .rotate() // Automatically orient image according to EXIF metadata
          .resize({
            width: 1920,
            height: 1920,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 85, effort: 4 })
          .toBuffer();

        contentType = 'image/webp';
        ext = '.webp';

        // Update originalname so database records reflect .webp filename
        const baseName = path.basename(file.originalname, path.extname(file.originalname));
        file.originalname = `${baseName}.webp`;
      } catch (sharpErr) {
        console.warn('[Sharp] Could not convert image to WebP, uploading original buffer:', sharpErr);
        uploadBuffer = file.buffer;
      }
    }

    const key = `${targetFolder}/${uniqueSuffix}${ext}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: uploadBuffer,
        ContentType: contentType,
        CacheControl: targetFolder.startsWith('rental/documents') ? 'private, no-cache' : 'public, max-age=31536000, immutable',
      })
    );

    file.location = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
    file.key = key;
    file.size = uploadBuffer.length;
    file.mimetype = contentType;
  };

  return {
    single: (fieldName: string) => [
      memoryMulter.single(fieldName),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const file = (req as any).file;
          if (file) {
            await processAndUploadFile(file, folder);
          }
          next();
        } catch (uploadErr) {
          console.error('[S3 Upload] Failed to upload file to S3:', uploadErr);
          next(uploadErr);
        }
      },
    ],
    fields: (fieldsConfig: { name: string; maxCount: number }[]) => [
      memoryMulter.fields(fieldsConfig),
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const files = (req as any).files;
          if (files) {
            for (const fieldName of Object.keys(files)) {
              for (const file of files[fieldName]) {
                const subFolder = fieldName === 'profile_photo' ? 'rental/profiles' : folder;
                await processAndUploadFile(file, subFolder);
              }
            }
          }
          next();
        } catch (uploadErr) {
          console.error('[S3 Upload] Failed to upload files to S3:', uploadErr);
          next(uploadErr);
        }
      },
    ],
  };
}

// ── SWM Uploaders ─────────────────────────────────────────────────────────────
export const uploadMedia = createOptimizedS3Uploader('media', mediaFileFilter, 50 * 1024 * 1024);
export const uploadComplaintAttachment = createOptimizedS3Uploader('complaints', complaintFileFilter, 10 * 1024 * 1024);

// ── Rental Management Uploaders (S3) ──────────────────────────────────────────
export const uploadRentalProfilePhoto = createOptimizedS3Uploader('rental/profiles', profilePhotoFileFilter, 5 * 1024 * 1024);
export const uploadRentalDocument = createOptimizedS3Uploader('rental/documents', rentalDocFileFilter, 15 * 1024 * 1024);
export const uploadRentalRegistrationDocs = createOptimizedS3Uploader('rental/documents', rentalDocFileFilter, 20 * 1024 * 1024);
