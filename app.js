import express from 'express';
import dotenv from 'dotenv';
import UsersRouter from './routers/users.router.js';
import AdminRouter from './routers/admin.router.js';
import ResumesRouter from './routers/resumes.router.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = 3032;

app.use(express.json());
app.use(cookieParser());

app.use('/api', [UsersRouter, ResumesRouter]);
app.use('/admin', [AdminRouter]);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
