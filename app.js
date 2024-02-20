import express from 'express';
import dotenv from 'dotenv';
import UserRouter from './src/routes/user.router.js';
import ResumeRouter from './src/routes/resume.router.js';
import AdminRouter from './src/routes/admin.router.js';
import errorHandlingMiddleware from './src/middlewares/error-handling.middleware.js';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import { sessionOption } from './src/utils/redis/redis.js';

dotenv.config();

const app = express();
const PORT = 3032;

// session cookie
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session(sessionOption));

app.use(express.json());

app.use('/admin', [AdminRouter]);
app.use('/user', [UserRouter]);
app.use('/resume', [ResumeRouter]);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, '포트로 서버가 열렸어요!');
});
