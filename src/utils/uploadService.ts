// multer-s3 v3 works with AWS SDK v3 (@aws-sdk/client-s3).
// Make sure to install: npm install @aws-sdk/client-s3
import { S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import multerS3 from "multer-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const upload = multer({
  storage: multerS3({
    s3: s3 as any,
    bucket: process.env.AWS_S3_BUCKET!,
    acl: "public-read",
    key: (req, file, cb) => {
      const userId = (req.user as string) || "unknown";
      cb(null, `users/${userId}/profile-${Date.now()}.jpg`);
    },
  }),
});