// Run this from: c:\Users\welcome\OneDrive\Desktop\GOVERNMENT-PROJECT\frontend
// Command: node upload_dist_to_s3.js

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// ── Config ──────────────────────────────────────────────────
const BUCKET = 'zila-panchayatimages';
const REGION = 'ap-south-1';
const S3_PREFIX = 'frontend-deploy'; // files will go to s3://bucket/frontend-deploy/
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist'); // ← frontend dist
// ────────────────────────────────────────────────────────────

// MIME type map
const mimeTypes = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.txt':  'text/plain',
  '.xml':  'application/xml',
  '.webp': 'image/webp',
};

// Recursively get all files
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

async function uploadDist() {
  // Try to load AWS credentials from .env
  let accessKeyId, secretAccessKey;
  try {
    const envFile = fs.readFileSync(path.join(__dirname, '..', 'backend', '.env'), 'utf8');
    envFile.split('\n').forEach(line => {
      const [key, ...rest] = line.split('=');
      const val = rest.join('=').trim().replace(/^"|"$/g, '');
      if (key && key.trim() === 'AWS_ACCESS_KEY_ID')     accessKeyId = val;
      if (key && key.trim() === 'AWS_SECRET_ACCESS_KEY') secretAccessKey = val;
    });
  } catch (_) {}

  const client = new S3Client({
    region: REGION,
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });

  const allFiles = getAllFiles(DIST_DIR);
  console.log(`\n📦 Uploading ${allFiles.length} files to s3://${BUCKET}/${S3_PREFIX}/\n`);

  let uploaded = 0;
  for (const filePath of allFiles) {
    const relativePath = path.relative(DIST_DIR, filePath).replace(/\\/g, '/');
    const s3Key = `${S3_PREFIX}/${relativePath}`;
    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    try {
      await client.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: s3Key,
        Body: fs.readFileSync(filePath),
        ContentType: contentType,
      }));
      uploaded++;
      process.stdout.write(`\r✅ ${uploaded}/${allFiles.length} - ${relativePath.slice(0, 60)}`);
    } catch (err) {
      console.error(`\n❌ Failed: ${relativePath} — ${err.message}`);
    }
  }

  console.log(`\n\n🎉 Upload complete! ${uploaded}/${allFiles.length} files uploaded.`);
  console.log(`\n📌 Now run this on EC2:\n`);
  console.log(`sudo apt install awscli -y`);
  console.log(`sudo aws s3 sync s3://${BUCKET}/${S3_PREFIX}/ /var/www/html/ --region ${REGION}`);
  console.log(`sudo systemctl reload nginx\n`);
}

uploadDist().catch(console.error);
