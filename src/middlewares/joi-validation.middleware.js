import Joi from 'joi';

export const signupSchema = Joi.object({
  email: Joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ['com', 'net'] },
  }),
  name: Joi.string().min(1).max(30).required().messages({
    'string.max': '이름은 30글자 이내의 문자열입니다.',
    'any.reauired': '이름은 필수 입력 항목입니다.',
  }),
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,30}$'))
    .required()
    .messages({
      'string.pattern.base':
        '비밀번호는 6-30자의 숫자와 영문자로 이루어지며 특수문자를 최소 한 자 이상 포함해야 합니다.',
      'string.empty': `빈 문자열은 비밀번호가 될 수 없습니다.`,
      'any.required': '비밀번호는 필수 입력 항목입니다.',
    }),
  checkPassword: Joi.string().required(),
});

export const validateSignup = async (req, res, next) => {
  try {
    const validation = await signupSchema.validateAsync(req.body);
    req.body = validation;
    next();
  } catch (err) {
    res.status(400).send(err.details[0].message);
  }
};

export const updateUserSchema = Joi.object({
  password: Joi.string()
    .pattern(new RegExp('^(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,30}$'))
    .messages({
      'string.pattern.base':
        '비밀번호는 6-30자의 숫자와 영문자로 이루어지며 특수문자를 최소 한 자 이상 포함해야 합니다.',
      'string.empty': `빈 문자열은 비밀번호가 될 수 없습니다.`,
    }),
  name: Joi.string().min(1).max(30).messages({
    'string.max': '이름은 30글자 이내의 문자열입니다.',
  }),
  age: Joi.number().min(19).max(65).messages({
    'number.min': '나이는 19살 이상이어야 합니다.',
    'number.max': '나이는 65살 미만이어야 합니다.',
  }),
  gender: Joi.string().valid('F', 'M').messages({
    'any.only': '성별은 F나 M이어야 합니다.',
  }),
});

export const validateUpdateUser = async (req, res, next) => {
  try {
    const validation = await updateUserSchema.validateAsync(req.body);
    req.body = validation;
    next();
  } catch (err) {
    res.status(400).send(err.details[0].message);
  }
};

export const createResumeSchema = Joi.object({
  title: Joi.string().min(2).max(30).required().messages({
    'any.required': '제목은 필수 입력 항목입니다.',
    'string.max': '제목은 30글자 이내의 문자열입니다.',
    'string.min': '제목은 2글자 이상의 문자열입니다.',
  }),
  introduction: Joi.string(),
  hobby: Joi.string(),
  status: Joi.string()
    .valid('APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS')
    .messages({
      'any.only':
        '이력서의 상태는 APPLY, DROP, PASS, INTERVIEW1, INTERVIEW2, FINAL_PASS 중 하나여야 합니다.',
    }),
});

export const validateCreateResume = async (req, res, next) => {
  try {
    const validation = await createResumeSchema.validateAsync(req.body);
    req.body = validation;
    next();
  } catch (err) {
    res.status(400).send(err.details[0].message);
  }
};

export const updateResumeSchema = Joi.object({
  title: Joi.string().min(2).max(30).messages({
    'string.max': '제목은 30글자 이내의 문자열입니다.',
    'string.min': '제목은 2글자 이상의 문자열입니다.',
  }),
  introduction: Joi.string(),
  hobby: Joi.string(),
  status: Joi.string()
    .valid('APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS')
    .messages({
      'any.only':
        '이력서의 상태는 APPLY, DROP, PASS, INTERVIEW1, INTERVIEW2, FINAL_PASS 중 하나여야 합니다.',
    }),
});

export const validateUpdateResume = async (req, res, next) => {
  try {
    const validation = await updateResumeSchema.validateAsync(req.body);
    req.body = validation;
    next();
  } catch (err) {
    res.status(400).send(err.details[0].message);
  }
};

export const resumeStatusSchema = Joi.object({
  status: Joi.string()
    .valid('APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS')
    .required()
    .messages({
      'any.required': '이력서의 상태는 필수 입력 항목입니다.',
      'any.only':
        '이력서의 상태는 APPLY, DROP, PASS, INTERVIEW1, INTERVIEW2, FINAL_PASS 중 하나여야 합니다.',
    }),
});

export const validateResumeStatus = async (req, res, next) => {
  try {
    const validation = await resumeStatusSchema.validateAsync(req.body);
    req.body = validation;
    next();
  } catch (err) {
    res.status(400).send(err.details[0].message);
  }
};

export const roleSchema = Joi.object({
  role: Joi.string().valid('USER', 'HR_MANAGER', 'ADMIN').required().messages({
    'any.required': '사용자의 권한은 필수 입력 항목입니다.',
    'any.only': '사용자의 권한은 USER, HR_MANAGER, ADMIN 중 하나여야 합니다.',
  }),
});

export const validateRole = async (req, res, next) => {
  try {
    const validation = await roleSchema.validateAsync(req.body);
    req.body = validation;
    next();
  } catch (err) {
    res.status(400).send(err.details[0].message);
  }
};

export const orderSchema = Joi.object({
  orderKey: Joi.string()
    .valid(
      'id',
      'userId',
      'title',
      'introduction',
      'hobby',
      'status',
      'createdAt',
      'updatedAt'
    )
    .messages({
      'any.only':
        'orderKey는 id, userId, title, introduction, hobby, status, createdAt, updatedAt 중 하나여야 합니다.',
    }),
  orderValue: Joi.string()
    .valid('asc', 'desc')
    .messages({ 'any.only': 'orderValue는 asc나 desc 중 하나여야 합니다.' }),
});

export const validateOrder = async (req, res, next) => {
  try {
    const validation = await orderSchema.validateAsync(req.query);
    req.query = validation;
    next();
  } catch (err) {
    res.status(400).send(err.details[0].message);
  }
};
