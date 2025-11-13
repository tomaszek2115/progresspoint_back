import dotenv from 'dotenv';
dotenv.config(); // Load .env file BEFORE importing app

import { app } from './app';

const PORT = process.env.PORT || 3000;

// Validate critical environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Warn if AWS S3 is not configured (uploads will fail)
const s3EnvVars = ['AWS_S3_BUCKET', 'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'];
const missingS3Vars = s3EnvVars.filter(varName => !process.env[varName]);

if (missingS3Vars.length > 0) {
  console.warn('AWS S3 not fully configured. Profile picture uploads will be disabled.');
  console.warn('   Missing:', missingS3Vars.join(', '));
} else {
  console.log('AWS S3 configured for profile picture uploads');
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));