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

// /** 사용자 계정 삭제 API */
// router.delete(
//   '/delete/:userId',
//   authMiddleware,
//   authAdminMiddleware,
//   async (req, res, next) => {
//     try {
//       const { userId } = req.params;
//       const result = await prisma.users.delete({
//         where: { userId: +userId },
//       });
//     } catch (err) {
//       next(err);
//     }
//     return res.status(200).json({ message: '성공적으로 삭제되었습니다.' });
//   }
// );

export default router;

/**
 * @swagger
 *  /admin/upgrade/{userId}:
 *    patch:
 *      summary: 일반 사용자 계정을 관리자나 인사담당자 계정으로 승급
 *      parameters:
 *        - in: path
 *          name: userId
 *          schema:
 *            type: integer
 *            example: 3
 *            required: true
 *            description: 사용자 ID
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Upgrade_user_request_body'
 *      responses:
 *        200:
 *          description: 승급 성공
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Users'
 *        404:
 *          description: 존재하지 않는 사용자
 *        412:
 *          description: incorrect role. role should be ADMIN or HR_MANAGER or USER
 *        401:
 *          description: 권한이 없습니다
 */
/**
 * @swagger
 * components:
 *  schemas:
 *    Upgrade_user_request_body:
 *      type: object
 *      properties:
 *        whichRole:
 *          type: string
 *          example: ADMIN or HR_MANAGER
 */
