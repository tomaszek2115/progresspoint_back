// multer-s3 v3 works with AWS SDK v3 (@aws-sdk/client-s3).
// Make sure to install: npm install @aws-sdk/client-s3
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

// If S3 environment variables are provided we use multer-s3 with S3Client.
// Otherwise (tests / local dev without S3) fall back to memory storage so
// requiring this module doesn't throw during initialization.
const isS3Configured = Boolean(
  process.env.AWS_S3_BUCKET && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
);

let storage: multer.StorageEngine;

if (isS3Configured) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  storage = multerS3({
    s3: s3 as any,
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