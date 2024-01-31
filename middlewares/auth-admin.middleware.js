export default async function (req, res, next) {
  if (req.user.role !== 'ADMIN')
    return res.status(401).json({ message: '권한이 없습니다.' });
  next();
}
