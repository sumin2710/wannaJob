import express from 'express';
import { UserController } from '../controllers/user.controller.js';
import { UserService } from '../services/user.service.js';
import { UserRepository } from '../repositories/user.repository.js';
import dataSource from '../typeorm/index.js';
import {
  validateSignup,
  validateUpdateUser,
} from '../middlewares/joi-validation.middleware.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';

import { upload } from '../utils/multer/multer.js';

const router = express.Router();

const userRepository = new UserRepository(dataSource);
const userService = new UserService(userRepository);
const userController = new UserController(userService);

/** 회원가입 API */
router.post('/sign-up', validateSignup, userController.signUp);

/** 로그인 API */
router.post('/sign-in', userController.signIn);

/** 로그아웃 API */
router.post('/log-out', userController.logOut);

/** 내 정보 조회 API */
router.get('/', authenticateUser, userController.getUser);

/** 내 정보 수정 API */
router.patch(
  '/',
  authenticateUser,
  upload.single('profileImage'),
  validateUpdateUser,
  userController.updateUser
);

export default router;
