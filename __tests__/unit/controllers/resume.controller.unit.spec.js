import { jest } from '@jest/globals';
import { ResumeController } from '../../../src/controllers/resume.controller';

let mockResumeService = {
  getResumesByUserId: jest.fn(),
  getResume: jest.fn(),
  getAllResumes: jest.fn(),
  updateResumeStatus: jest.fn(),
};

let resumeController = new ResumeController(mockResumeService);

describe('Resume Controller Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('getMyResumes Method', async () => {
    const req = { userId: 6 };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

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
    mockResumeService.getResumesByUserId.mockReturnValue(resumes);

    await resumeController.getMyResumes(req, res);

    expect(mockResumeService.getResumesByUserId).toHaveBeenCalledTimes(1);
    expect(mockResumeService.getResumesByUserId).toHaveBeenCalledWith(
      req.userId
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ resumes });
  });

  test('getResume Method', async () => {
    const req = { params: { resumeId: 6 }, userId: 6, role: 'USER' };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const resume = {
      userId: 6,
      title: '제목6',
      introduction: '내용6',
      hobby: '취미6',
      status: 'APPLY',
      createdAt: '2024-02-21T06:38:42.129Z',
      updatedAt: '2024-02-21T06:50:42.129Z',
      id: 6,
    };

    mockResumeService.getResume.mockReturnValue(resume);

    await resumeController.getResume(req, res);

    expect(mockResumeService.getResume).toHaveBeenCalledTimes(1);
    expect(mockResumeService.getResume).toHaveBeenCalledWith(
      req.params.resumeId,
      req.userId,
      req.role
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ resume });
  });

  test('getAllResumes Method', async () => {
    const req = { query: { orderKey: 'createdAt', orderValue: 'desc' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
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

    mockResumeService.getAllResumes.mockReturnValue(resumes);

    await resumeController.getAllResumes(req, res);

    expect(mockResumeService.getAllResumes).toHaveBeenCalledTimes(1);
    expect(mockResumeService.getAllResumes).toHaveBeenCalledWith(
      req.query.orderKey,
      req.query.orderValue
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ resumes });
  });

  test('changeResumeStatus Method', async () => {
    const req = { params: { resumeId: 6 }, body: { status: 'INTERVIEW1' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const resume = {
      userId: 6,
      title: '제목6',
      introduction: '내용6',
      hobby: '취미6',
      status: 'INTERVIEW1',
      createdAt: '2024-02-21T06:38:42.129Z',
      updatedAt: '2024-02-21T06:50:42.129Z',
      id: 6,
    };

    mockResumeService.updateResumeStatus.mockReturnValue(resume);

    await resumeController.changeResumeStatus(req, res);

    expect(mockResumeService.updateResumeStatus).toHaveBeenCalledTimes(1);
    expect(mockResumeService.updateResumeStatus).toHaveBeenCalledWith(
      req.params.resumeId,
      req.body.status
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ resume });
  });
});
