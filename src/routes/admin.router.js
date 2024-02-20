import express from 'express';
import { prisma } from '../utils/prisma/index.js';
import { AdminController } from '../controllers/admin.controller.js';
import { AdminService } from '../services/admin.service.js';
import { UserRepository } from '../repositories/user.repository.js';

import { validateRole } from '../middlewares/joi-validation.middleware.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/auth-role.middleware.js';

const router = express.Router();

const userRepository = new UserRepository(prisma);
const adminService = new AdminService(userRepository);
const adminController = new AdminController(adminService);

/** 관리자나 인사담당자 계정으로 승급 API (관리자만 가능) */
router.patch(
  '/upgrade/:userId',
  authenticateUser,
  checkRole('ADMIN'),
  validateRole,
  adminController.upgradeUserRole
);

/** 사용자 계정 삭제 API */
router.delete(
  '/delete/:userId',
  authenticateUser,
  checkRole('ADMIN'),
  adminController.deleteUser
);

export default router;
