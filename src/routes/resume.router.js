import express from 'express';
import dataSource from '../typeorm/index.js';
import { ResumeController } from '../controllers/resume.controller.js';
import { ResumeService } from '../services/resume.service.js';
import { ResumeRepository } from '../repositories/resume.repository.js';

import {
  validateCreateResume,
  validateUpdateResume,
  validateResumeStatus,
  validateOrder,
} from '../middlewares/joi-validation.middleware.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { checkRole } from '../middlewares/auth-role.middleware.js';

const router = express.Router();

const resumeRepository = new ResumeRepository(dataSource);
const resumeService = new ResumeService(resumeRepository);
const resumeController = new ResumeController(resumeService);

/** 이력서 생성 API */
router.post(
  '/',
  authenticateUser,
  validateCreateResume,
  resumeController.createResume
);

/** 이력서 삭제 API */
router.delete('/:resumeId', authenticateUser, resumeController.deleteResume);

/** 이력서 수정 API */
router.patch(
  '/:resumeId',
  authenticateUser,
  validateUpdateResume,
  resumeController.updateResume
);

/** 내 이력서 전체 조회 API */
router.get('/my', authenticateUser, resumeController.getMyResumes);

/** 이력서 상세 조회 API (사용자는 본인의 이력서만, 인사담당자는 전부 열람 가능) */
router.get('/:resumeId', authenticateUser, resumeController.getResume);

/** 모든 이력서 목록 조회 API (인사담당자만 가능) */
router.get(
  '/',
  authenticateUser,
  checkRole('HR_MANAGER'),
  validateOrder,
  resumeController.getAllResumes
);

/** 이력서의 상태(status)'만' 변경 API (인사담당자만 가능) */
router.patch(
  '/:resumeId/changeStatus',
  authenticateUser,
  checkRole('HR_MANAGER'),
  validateResumeStatus,
  resumeController.changeResumeStatus
);

export default router;
