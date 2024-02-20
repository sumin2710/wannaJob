import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
  const { accessToken } = req.cookies;
  if (!accessToken) return res.status(401).send('로그인이 필요합니다.');

  try {
    const decodedAccessToken = jwt.verify(
      accessToken,
      process.env.ACCESS_SECRET_KEY
    );
    req.userId = decodedAccessToken.userId; // user 객체 대신 userId, role 저장
    req.role = decodedAccessToken.role;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      // 만료 시, session의 refreshToken으로 새 accessToken 발급
      const { refreshToken } = req.session;
      const decodedRefreshToken = jwt.verify(
        refreshToken,
        process.env.REFRESH_SECRET_KEY
      );

      if (
        decodedRefreshToken.ip === req.ip &&
        decodedRefreshToken.userAgent === req.headers['user-agent']
      ) {
        const newAccessToken = jwt.sign(
          {
            userId: decodedRefreshToken.userId,
            role: decodedRefreshToken.role,
          },
          process.env.ACCESS_SECRET_KEY,
          { expiresIn: '1h' }
        );
        res.cookie('accessToken', newAccessToken); // 쿠키에 accessToken 저장
        req.userId = decodedRefreshToken.userId;
        req.role = decodedRefreshToken.role;

        next();
      } else {
        res.status(401).send('로그인이 필요합니다.');
      }
    } else if (err.name === 'JsonWebTokenError') {
      res.status(401).send('토큰이 조작되었습니다.');
    } else {
      res.status(400).send(err.details[0].message);
    }
  }
};
