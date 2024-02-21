import NotFoundError from '../errors/NotFoundError.js';
import PermissionError from '../errors/PermissionError.js';

export class ResumeService {
  constructor(resumeRepository) {
    this.resumeRepository = resumeRepository;
  }

  createResume = async (resumeData) => {
    const resume = await this.resumeRepository.createResume(resumeData);
    return resume;
  };

  deleteResume = async (resumeId, userId) => {
    // 이력서 존재 유무 확인
    const isExistResume = await this.resumeRepository.getResumeById(resumeId);
    if (!isExistResume)
      throw new NotFoundError('이력서 조회에 실패하였습니다.');
    if (isExistResume.userId !== userId)
      throw new PermissionError('삭제 권한이 없습니다.');

    await this.resumeRepository.deleteResume(resumeId);
  };

  updateResume = async (resumeData) => {
    // 이력서 존재 유무 확인
    const isExistResume = await this.resumeRepository.getResumeById(
      resumeData.id
    );
    if (!isExistResume)
      throw new NotFoundError('이력서 조회에 실패하였습니다.');
    if (isExistResume.userId !== resumeData.userId)
      throw new PermissionError('수정 권한이 없습니다.');

    const resume = await this.resumeRepository.updateResume(resumeData);
    return resume;
  };

  getResumesByUserId = async (userId) => {
    const resumes = await this.resumeRepository.getResumesByUserId(userId);
    return resumes;
  };

  getResume = async (resumeId, userId, userRole) => {
    const resume = await this.resumeRepository.getResumeById(resumeId);
    if (!resume) throw new NotFoundError('이력서 조회에 실패하였습니다.');
    if (resume.userId !== userId && userRole !== 'HR_MANAGER')
      throw new PermissionError('조회 권한이 없습니다.');
    return resume;
  };

  getAllResumes = async (orderKey = 'createdAt', orderValue = 'desc') => {
    const resumes = await this.resumeRepository.getAllResumes(
      orderKey,
      orderValue
    );
    return resumes;
  };

  updateResumeStatus = async (resumeId, status) => {
    // 이력서 존재 유무 확인
    const isExistResume = await this.resumeRepository.getResumeById(resumeId);
    if (!isExistResume)
      throw new NotFoundError('이력서 조회에 실패하였습니다.');

    const resume = await this.resumeRepository.updateResumeStatus(
      resumeId,
      status
    );
    return resume;
  };
}
