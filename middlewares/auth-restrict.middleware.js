export const checkRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role)
      return res.status(401).json({ message: '권한이 없습니다.' });
    next();
  };
};
