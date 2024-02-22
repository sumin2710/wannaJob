import multer from 'multer';
import multerS3 from 'multer-s3';
import { S3Client } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import 'dotenv/config';

export const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

export const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

/** 랜덤 문자열 생성 함수 */
export const randomName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const ext = file.mimetype.split('/')[1];
      cb(null, `profileImage/${randomName()}.${ext}`);
    },
  }),
  limits: { fileSize: 1024 * 1024 * 10 }, // 10MB
});
