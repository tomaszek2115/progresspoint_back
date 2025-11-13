# Troubleshooting Guide

## Profile Picture Upload Not Working

### Symptoms
- Other endpoints work fine (login, workouts, etc.)
- POST `/user/picture` returns `400 "No file uploaded"` or `503 "File upload service not configured"`

### Root Causes & Solutions

#### 1. Environment Variables Not Loaded ✅ FIXED

**Problem:** The app wasn't loading the `.env` file.

**Solution:** Added `dotenv.config()` to `src/index.ts`.

**Verify it's working:**
```bash
# Start the server - you should see this message:
npm run dev

# Expected output:
# ✅ AWS S3 configured for profile picture uploads
# Server running on port 3000

# If you see this instead:
# ⚠️  AWS S3 not fully configured. Profile picture uploads will be disabled.
# Then your .env is not being loaded correctly.
```

#### 2. Missing or Invalid .env File

**Problem:** The `.env` file doesn't exist or has wrong format.

**Solution:**
1. Copy `.env.example` to `.env`
2. Fill in your actual AWS credentials
3. Remove quotes from values (dotenv doesn't need them)

**Wrong format:**
```bash
DB_PROVIDER="postgresql"  # ❌ Quotes may cause issues
AWS_REGION="eu-central-1" # ❌ Quotes may cause issues
```

**Correct format:**
```bash
DB_PROVIDER=postgresql    # ✅ No quotes
AWS_REGION=eu-central-1   # ✅ No quotes
```

#### 3. AWS Credentials Issues

**Check if credentials are loaded:**
```bash
# Add this temporarily to src/index.ts after dotenv.config():
console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
console.log('AWS_REGION:', process.env.AWS_REGION);
```

**Common issues:**
- Extra spaces in .env file
- Wrong file encoding (use UTF-8)
- .env file in wrong directory (must be in project root)

#### 4. S3 Permissions

**Problem:** AWS credentials are correct but S3 upload fails with 403 Forbidden.

**Solution:** Ensure your IAM user has these S3 permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::progresspoint/*"
    }
  ]
}
```

#### 5. S3 Bucket Configuration

**Problem:** Bucket doesn't allow public-read ACL.

**Check bucket settings:**
- Block Public Access: Should allow public ACLs
- CORS configuration: Should allow your frontend origin

**CORS example:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:6969"],
    "ExposeHeaders": []
  }
]
```

#### 6. Docker Environment Variables

**Problem:** Using Docker but env vars not passed to container.

**Solution:** Update `docker-compose.yml`:
```yaml
backend:
  build: .
  env_file:
    - .env  # Add this line
  environment:
    DATABASE_URL: "postgresql://admin:secret@db:5432/progresspoint_app"
```

### Testing the Fix

1. **Install dependencies:**
```bash
npm install
```

2. **Start the server:**
```bash
npm run dev
```

3. **Check startup logs:**
```
✅ AWS S3 configured for profile picture uploads
Server running on port 3000
```

4. **Test upload:**
```bash
# First login to get token
TOKEN=$(curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"test"}' \
  | jq -r '.token')

# Upload a picture
curl -X POST http://localhost:3000/user/picture \
  -H "Authorization: Bearer $TOKEN" \
  -F "picture=@/path/to/image.jpg"

# Should return:
# {"profileImageUrl":"https://progresspoint.s3.eu-central-1.amazonaws.com/users/xxx/profile-123.jpg"}
```

### Quick Diagnostics

Run this command to check your configuration:
```bash
node -e "require('dotenv').config(); console.log('S3 Bucket:', process.env.AWS_S3_BUCKET); console.log('Region:', process.env.AWS_REGION); console.log('Access Key:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'MISSING');"
```

Expected output:
```
S3 Bucket: progresspoint
Region: eu-central-1
Access Key: SET
```

### Still Not Working?

1. Check server logs for errors
2. Verify the file is actually being sent (check request in browser DevTools)
3. Try a different image file
4. Check AWS CloudTrail for API call logs
5. Test AWS credentials with AWS CLI:
```bash
aws s3 ls s3://progresspoint --region eu-central-1
```
