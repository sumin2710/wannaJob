import { prisma } from '../models/index.js';
import jwt from 'jsonwebtoken';

export default async function (req, res, next) {
  try {
    const { Authorization } = req.cookies;
    if (!Authorization) throw new Error('로그인이 필요합니다.');

    const [tokenType, token] = Authorization.split(' ');
    if (tokenType !== 'Bearer')
      throw new Error('토큰 타입이 형식에 맞지 않습니다.');

    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);

    const userId = decodedToken.userId;
    const user = await prisma.users.findFirst({ where: { userId: +userId } });
    if (!user) throw new Error('토큰 사용자가 존재하지 않습니다.');

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return res.status(401).json({ message: '토큰이 만료되었습니다.' });
    if (err.name === 'JsonWebTokenError')
      return res.status(401).json({ message: '토큰이 조작되었습니다.' });
    return res.status(400).json({ message: err.message });
  }
}
