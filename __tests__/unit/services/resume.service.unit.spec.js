import { jest } from '@jest/globals';
import { ResumeService } from '../../../src/services/resume.service';
import NotFoundError from '../../../src/errors/NotFoundError.js';
import PermissionError from '../../../src/errors/PermissionError.js';

let mockResumeRepository = {
  createResume: jest.fn(),
  getResumeById: jest.fn(),
  deleteResume: jest.fn(),
  updateResume: jest.fn(),
  getResumesByUserId: jest.fn(),
  getAllResumes: jest.fn(),
  updateResumeStatus: jest.fn(),
};

let resumeService = new ResumeService(mockResumeRepository);

describe('Resume Service Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('createResume Method', async () => {
    const sampleResume = {
      userId: 6,
      title: '제목5',
      introduction: '내용5',
      hobby: '취미5',
      status: 'APPLY',
      createdAt: '2024-02-21T06:38:42.129Z',
      updatedAt: '2024-02-21T06:38:42.129Z',
      id: 6,
    };
    mockResumeRepository.createResume.mockReturnValue(sampleResume);

    const result = await resumeService.createResume(sampleResume);

    expect(mockResumeRepository.createResume).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.createResume).toHaveBeenCalledWith(
      sampleResume
    );
    expect(result).toEqual(sampleResume);
  });

  test('deleteResume Method', async () => {
    const sampleResume = {
      userId: 6,
      title: '제목5',
      introduction: '내용5',
      hobby: '취미5',
      status: 'APPLY',
      createdAt: '2024-02-21T06:38:42.129Z',
      updatedAt: '2024-02-21T06:38:42.129Z',
      id: 6,
    };
    const resumeId = 6;
    const userId = 6;
    mockResumeRepository.getResumeById.mockReturnValue(sampleResume);
    mockResumeRepository.deleteResume.mockReturnValue(true);

    await resumeService.deleteResume(resumeId, userId);

    expect(mockResumeRepository.getResumeById).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.getResumeById).toHaveBeenCalledWith(resumeId);
    expect(mockResumeRepository.deleteResume).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.deleteResume).toHaveBeenCalledWith(resumeId);
  });

  test('deleteResume Method By NotFoundError', async () => {
    const resumeId = 888;
    const userId = 6;
    mockResumeRepository.getResumeById.mockReturnValue(null);

    try {
      await resumeService.deleteResume(resumeId, userId);
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toEqual('이력서 조회에 실패하였습니다.');
    }
  });

  test('deleteResume Method By PermissionError', async () => {
    const resumeId = 6;
    const userId = 888;
    const sampleResume = {
      userId: 6,
      title: '제목5',
      introduction: '내용5',
      hobby: '취미5',
      status: 'APPLY',
      createdAt: '2024-02-21T06:38:42.129Z',
      updatedAt: '2024-02-21T06:38:42.129Z',
      id: 6,
    };

    mockResumeRepository.getResumeById.mockReturnValue(sampleResume);

    try {
      await resumeService.deleteResume(resumeId, userId);
    } catch (err) {
      expect(err).toBeInstanceOf(PermissionError);
      expect(err.message).toEqual('삭제 권한이 없습니다.');
    }
  });
  test('updateResume Method', async () => {
    const sampleResume = {
      userId: 6,
      title: '제목5',
      introduction: '내용5',
      hobby: '취미5',
      status: 'APPLY',
      createdAt: '2024-02-21T06:38:42.129Z',
      updatedAt: '2024-02-21T06:38:42.129Z',
      id: 6,
    };
    const params = {
      id: 6,
      userId: 6,
      title: '제목6',
      introduction: '내용6',
      hobby: '취미6',
    };
    const updateResume = {
      userId: 6,
      title: '제목6',
      introduction: '내용6',
      hobby: '취미6',
      status: 'APPLY',
      createdAt: '2024-02-21T06:38:42.129Z',
      updatedAt: '2024-02-21T06:50:42.129Z',
      id: 6,
    };
    mockResumeRepository.getResumeById.mockReturnValue(sampleResume);
    mockResumeRepository.updateResume.mockReturnValue(updateResume);

    const result = await resumeService.updateResume(params);

    expect(mockResumeRepository.getResumeById).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.getResumeById).toHaveBeenCalledWith(params.id);
    expect(mockResumeRepository.updateResume).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.updateResume).toHaveBeenCalledWith(params);
    expect(result).toEqual(updateResume);
  });

  test('getResumesByUserId Method', async () => {
    const userId = 6;
    const resumes = [
      {
        userId: 6,
        title: '제목6',
        introduction: '내용6',
        hobby: '취미6',
        status: 'APPLY',
        createdAt: '2024-02-21T06:38:42.129Z',
        updatedAt: '2024-02-21T06:50:42.129Z',
        id: 6,
      },
    ];
    mockResumeRepository.getResumesByUserId.mockReturnValue(resumes);

    const result = await resumeService.getResumesByUserId(userId);

    expect(mockResumeRepository.getResumesByUserId).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.getResumesByUserId).toHaveBeenCalledWith(
      userId
    );
    expect(result).toEqual(resumes);
  });

  test('getResume Method', async () => {
    const userId = 6;
    const resumeId = 6;
    const userRole = 'HR_MANAGER';
    const sampleResume = {
      userId: 6,
      title: '제목6',
      introduction: '내용6',
      hobby: '취미6',
      status: 'APPLY',
      createdAt: '2024-02-21T06:38:42.129Z',
      updatedAt: '2024-02-21T06:50:42.129Z',
      id: 6,
    };
    mockResumeRepository.getResumeById.mockReturnValue(sampleResume);

    const result = await resumeService.getResume(resumeId, userId, userRole);

    expect(mockResumeRepository.getResumeById).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.getResumeById).toHaveBeenCalledWith(resumeId);
    expect(result).toEqual(sampleResume);
  });

  test('getAllResumes Method', async () => {
    const resumes = [
      {
        userId: 4,
        title: '제목4',
        introduction: '내용4',
        hobby: '취미4',
        status: 'APPLY',
        createdAt: '2024-02-20T06:38:42.129Z',
        updatedAt: '2024-02-20T06:50:42.129Z',
        id: 4,
      },
      {
        userId: 6,
        title: '제목6',
        introduction: '내용6',
        hobby: '취미6',
        status: 'APPLY',
        createdAt: '2024-02-21T06:38:42.129Z',
        updatedAt: '2024-02-21T06:50:42.129Z',
        id: 6,
      },
    ];
    mockResumeRepository.getAllResumes.mockReturnValue(resumes);

    const result = await resumeService.getAllResumes();

    expect(mockResumeRepository.getAllResumes).toHaveBeenCalledTimes(1);
    expect(result).toEqual(resumes);
  });

  test('updateResumeStatus Method', async () => {
    const sampleResume = {
      userId: 6,
      title: '제목6',
      introduction: '내용6',
      hobby: '취미6',
      status: 'APPLY',
      createdAt: '2024-02-21T06:38:42.129Z',
      updatedAt: '2024-02-21T06:50:42.129Z',
      id: 6,
    };
    const resumeId = 6;
    const status = 'INTERVIEW1';
    const updateResume = {
      status: 'INTERVIEW1',
      createdAt: '2024-02-21T06:38:42.129Z',
      updatedAt: '2024-02-21T07:50:42.129Z',
    };
    mockResumeRepository.getResumeById.mockReturnValue(sampleResume);
    mockResumeRepository.updateResumeStatus.mockReturnValue({
      ...sampleResume,
      ...updateResume,
    });

    const result = await resumeService.updateResumeStatus(resumeId, status);

    expect(mockResumeRepository.getResumeById).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.getResumeById).toHaveBeenCalledWith(resumeId);
    expect(mockResumeRepository.updateResumeStatus).toHaveBeenCalledTimes(1);
    expect(mockResumeRepository.updateResumeStatus).toHaveBeenCalledWith(
      resumeId,
      status
    );
    expect(result).toEqual({ ...sampleResume, ...updateResume });
  });
});
