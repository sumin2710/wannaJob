import { prisma } from '../models/index.js';
import jwt from 'jsonwebtoken';

export default async function (req, res, next) {
  try {
    const { accessToken } = req.cookies;
    if (!accessToken) throw new Error('로그인이 필요합니다.');

    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY);

    const userId = decodedToken.userId;
    const user = await prisma.users.findFirst({ where: { userId: +userId } });
    if (!user) throw new Error('토큰 사용자가 존재하지 않습니다.');

    req.user = user; // **********
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      createNewAccessToken(req, res);
    } else if (err.name === 'JsonWebTokenError') {
      return res
        .status(401)
        .json({ message: '토큰이 조작되었습니다.', m: err.message });
    } else {
      return res.status(400).json({ message: err.message });
    }
  }
}

/** 토큰 검증 함수 */
function validateToken(token, secretKey) {
  try {
    const payload = jwt.verify(token, secretKey);
    return payload;
  } catch (err) {
    return null;
  }
}

/** refresh token으로 새 access token 발급 */
async function createNewAccessToken(req, res) {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return res.status(401).json({
      message:
        'refreshtoken이 존재하지 않습니다. 재발급을 위해서 재로그인이 필요합니다.',
    });
  }
  const decodedToken = validateToken(
    refreshToken,
    process.env.REFRESH_SECRET_KEY
  );
  if (!decodedToken)
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });

  const { userId, role } = decodedToken;

  const user_token_info = await prisma.refreshTokens.findFirst({
    where: { userId: +userId },
    select: { ip: true, userAgent: true },
  });

  if (
    user_token_info.ip !== req.ip ||
    user_token_info.userAgent !== req.headers['user-agent']
  ) {
    return res.status(401).json({ message: '토큰이 조작되었습니다.' });
  }

  const newAccessToken = jwt.sign(
    { userId, role },
    process.env.ACCESS_SECRET_KEY,
    { expiresIn: '7d' }
  );
  console.log('액세스', newAccessToken);

  return res
    .cookie('accessToken', newAccessToken)
    .status(200)
    .json({ message: 'accesstoken이 발급되었습니다.' });
}
