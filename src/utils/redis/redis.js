import redis from 'redis';
import RedisStore from 'connect-redis';
import 'dotenv/config';

export const redisClient = redis.createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on('connect', () => {
  console.info('Redis connected!');
});
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});
redisClient.connect().then(); // redis v4 연결 (비동기)

export const sessionOption = {
  resave: false,
  saveUninitialized: true,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({ client: redisClient, prefix: 'session:' }), // 세션 데이터를 로컬 서버 메모리가 아닌 redis db에 저장하도록 등록
};
