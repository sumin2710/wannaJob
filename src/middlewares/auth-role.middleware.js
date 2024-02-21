export const checkRole = (role) => {
  return (req, res, next) => {
    if (req.role !== role) return res.status(403).send('권한이 없습니다.');
    next();
  };
};
