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
import fileUpload from 'express-fileupload'; // to receive image from insomnia // send image to AWS bucket
import AWS from 'aws-sdk';
AWS.config.update({ region: process.env.AWS_BUCKET_REGION });

dotenv.config();

const app = express();
const PORT = 3032;

// swagger
const specs = swaggerJSDoc(options);
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

app.use(express.json());
app.use(cookieParser());
app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // maximum 10MB
  })
);

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post('/uploadImg', async ({ files }, res, next) => {
  const uploadParams = {
    Bucket: 'wanna-job', // bucket 이름
    Key: `profile/${Date.now()}-${files.file.name}`, // 파일 이름(req.files -> {files}로 구조분해할당 했음) // 같은 이름의 이미지가 들어가면 덮어씌워지기 때문에 현재시간을 줌
    Body: Buffer.from(files.file.data),
    ContentType: files.file.mimetype, // png, jpeg ...
    ACL: 'public-read',
  };

  s3.upload(uploadParams, function (err, data) {
    err && console.log('Error', err);
    data && console.log('Upload Success', data.Location);
  });
  res.send('ok');

  // DB에 data.Location 저장
});

// reupload후 DB에 저장한거 수정
app.update('/updateImg');

app.use('/api', [UsersRouter, ResumesRouter]);
app.use('/admin', [AdminRouter]);
app.use('/follow', [FollowsRouter]);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
