import express from 'express';
import dotenv from 'dotenv';
import UsersRouter from './routers/users.router.js';
import AdminRouter from './routers/admin.router.js';
import FollowsRouter from './routers/follows.router.js';
import ResumesRouter from './routers/resumes.router.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import cookieParser from 'cookie-parser';
import options from './swagger.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import multer from 'multer';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import crypto from 'crypto';
import sharp from 'sharp';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

dotenv.config();

const app = express();
const PORT = 3032;

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  },
  region: bucketRegion,
});

// multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

upload.single('profileImage'); // single img name I am uploading

// swagger
const specs = swaggerJSDoc(options);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

app.use(express.json());
app.use(cookieParser());

const client = new S3Client(clientParams);
const command = new GetObjectCommand(getObjectParams);
const url = await getSignedUrl(client, command, { expiresIn: 3600 });

app.get('/api/posts', async (req, res) => {
  const posts = await prisma.posts.findMany({ orderBy: { createdAt: 'desc' } });
  // each post 마다 url을 생성
  for (const post of posts) {
    const getObjectParams = {
      Bucket: bucketName,
      Key: post.imageName, // db에서 가져온 이름
    };
    const command = new GetObjectCommand(getObjectParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 3600s 후 만료 (1h)
    post.imageUrl = url;
  }
});

// 삭제한다
app.delete('/api/posts/:postId', async (req, res) => {
  const id = +req.params.postId;
  const post = await prisma.posts.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ message });

  //post.imageName // key for delete for s3 bucket
  const params = {
    Bucket: bucketName,
    Key: post.imageName,
  };
  const command = new DeleteObjectCommand(params);
  await s3.send(command); //send  delete command to s3

  await prisma.posts.delete(); // db에서 삭제
});

const randomImgName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');
// 저장
app.post('/api/posts', upload.single('image'), async (req, res) => {
  console.log('req.body', req.body);
  console.log('req.file', req.file);

  // sharp : resize image
  const buffer = await sharp(req.file.buffer)
    .resize({ height: 320, width: 320, fit: 'contain' })
    .toBuffer();
  const imageName = randomImgName();
  const params = {
    Bucket: bucketName,
    Key: imageName, //'${Date.now()}-${req.file.originalname}`, // 파일의 실제 이름
    // 같은 이름의 경우 업로드할 때마다 덮어씌워진다. 따라서 유저마다 고유해야 함. 보안을 위해서 예측 못할 문자열이면 더 좋겠지
    Body: buffer, // 실제 데이터(이미지 전체)
    ContentType: req.file.mimetype, // 확장자 png, jpeg ...
  };

  const command = new PutObjectCommand(params);
  await s3.send(command); // command를 s3 버킷으로 보낸다

  //-------------DB에 저장----------------------
  const post = await prisma.posts.create({
    data: {
      caption: req.body.caption,
      imageName: imageName,
    },
  });

  res.send({});
});

app.use('/api', [UsersRouter, ResumesRouter]);
app.use('/admin', [AdminRouter]);
app.use('/follow', [FollowsRouter]);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
