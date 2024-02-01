import express from 'express';
import { prisma } from '../models/index.js';
import authAdminMiddleware from '../middlewares/auth-admin.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

/** 관리자나 인사담당자 계정으로 승급 API (관리자만 가능) */
router.patch(
  '/upgrade/:userId',
  authMiddleware,
  authAdminMiddleware,
  async (req, res, next) => {
    try {
      const { whichRole } = req.body;
      if (!whichRole) return res.status(400).json({ message: 'which role?' });
      const enum_role = ['BASIC', 'HR_MANAGER', 'ADMIN'];
      if (!enum_role.includes(whichRole))
        return res.status(412).json({ message: 'incorrect role' });

      const { userId } = req.params;
      const isExistUser = await prisma.users.findFirst({
        where: { userId: +userId },
      });
      if (!isExistUser)
        return res.status(404).json({ message: '존재하지 않는 사용자' });
      const user = await prisma.users.update({
        where: { userId: +userId },
        data: { role: whichRole },
      });
      return res.status(200).json({ data: user });
    } catch (err) {
      next(err);
    }
  }
);

/** 사용자 계정 삭제 API */
router.delete(
  '/delete/:userId',
  authMiddleware,
  authAdminMiddleware,
  async (req, res, next) => {
    try {
      const { userId } = req.params;
      const result = await prisma.users.delete({
        where: { userId: +userId },
      });
    } catch (err) {
      next(err);
    }
    return res.status(200).json({ message: '성공적으로 삭제되었습니다.' });
  }
);

export default router;
