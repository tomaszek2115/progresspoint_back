// multer-s3 v3 works with AWS SDK v3 (@aws-sdk/client-s3).
// Make sure to install: npm install @aws-sdk/client-s3
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

// If S3 environment variables are provided we use multer-s3 with S3Client.
// Otherwise (tests / local dev without S3) fall back to memory storage so
// requiring this module doesn't throw during initialization.
const isS3Configured = Boolean(
  process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
);

let storage: multer.StorageEngine;
let s3Client: S3Client | null = null;

if (isS3Configured) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  storage = multerS3({
    s3: s3Client as any,
    bucket: process.env.AWS_S3_BUCKET!,
    acl: "public-read",
    key: (req, file, cb) => {
      const userId = (req.user as string) || "unknown";
      cb(null, `users/${userId}/profile-${Date.now()}.jpg`);
    },
  });
} else {
  // In-memory storage is suitable for tests and local development without S3.
  storage = multer.memoryStorage();
}

export const upload = multer({ storage });

// Helper function to delete old profile picture from S3
export const deleteS3File = async (fileUrl: string): Promise<void> => {
  if (!s3Client || !process.env.AWS_S3_BUCKET) {
    console.warn('S3 not configured, skipping file deletion');
    return;
  }

  try {
    // Extract key from S3 URL
    // URL format: https://bucket.s3.region.amazonaws.com/key
    // or: https://s3.region.amazonaws.com/bucket/key
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/').filter(p => p);
    
    // Get the key (everything after bucket name in path)
    const key = pathParts.join('/');
    
    if (!key) {
      console.warn('Could not extract S3 key from URL:', fileUrl);
      return;
    }

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    await s3Client.send(deleteCommand);
    console.log('Deleted old profile picture from S3:', key);
  } catch (err) {
    console.error('Error deleting file from S3:', err);
    // Don't throw - deletion failure shouldn't block upload
  }
};