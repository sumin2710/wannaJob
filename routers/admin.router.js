import express from 'express';
import { prisma } from '../models/index.js';

const router = express.Router();

/** 관리자 계정으로 승급 API */
router.patch('/upgrade/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    const isExistUser = await prisma.users.findFirst({
      where: { userId: +userId },
    });
    if (!isExistUser)
      return res.status(404).json({ message: '존재하지 않는 사용자' });
    const user = await prisma.users.update({
      where: { userId: +userId },
      data: { role: 'ADMIN' },
    });
    return res.status(200).json({ data: user });
  } catch (err) {
    next(err);
  }
});

export default router;
