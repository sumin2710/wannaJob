import { jest } from '@jest/globals';
import { ResumeRepository } from '../../../src/repositories/resume.repository';

let mockPrisma = {
  resume: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

let resumeRepository = new ResumeRepository(mockPrisma);

describe('Resume Repository Unit Test', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('createResume Method', async () => {
    const mockReturn = 'Resume object';
    mockPrisma.resume.create.mockReturnValue(mockReturn);

    // createResume Method를 실행하기 위한 파라미터
    const createResumeParams = {
      title: '제목',
      introduction: '내용',
      hobby: '취미',
    };

    // resumeRepository의 createResume Method 실행
    const resume = await resumeRepository.createResume(createResumeParams);
    // 실행한 결과값은 설정한 반환값과 동일한지 테스트
    expect(resume).toEqual(mockReturn);
    // 실행했을 때 prisma.resume의 create를 1번만 실행하는지 테스트
    expect(mockPrisma.resume.create).toHaveBeenCalledTimes(1);
    // 실행했을 때 prisma.resume의 create를 아래와 같은 값으로 호출
    expect(mockPrisma.resume.create).toHaveBeenCalledWith({
      data: createResumeParams,
    });
  });

  test('getResumeById Method', async () => {
    const mockReturn = 'Resume object';
    mockPrisma.resume.findUnique.mockReturnValue(mockReturn);
    const mockResumeId = 3;
    const resume = await resumeRepository.getResumeById(mockResumeId);

    expect(resume).toBe(mockReturn);
    expect(resumeRepository.prisma.resume.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.resume.findUnique).toHaveBeenCalledWith({
      where: { id: +mockResumeId },
    });
  });

  test('deleteResume Method', async () => {
    const mockResumeId = 3;

    mockPrisma.resume.delete.mockResolvedValue(true);
    await resumeRepository.deleteResume(mockResumeId);

    expect(resumeRepository.prisma.resume.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.resume.delete).toHaveBeenCalledWith({
      where: { id: +mockResumeId },
    });
  });

  test('updateResume Method', async () => {
    const mockReturn = 'Resume object';
    mockPrisma.resume.update.mockReturnValue(mockReturn);

    const mockResumeData = {
      title: '제목',
      introduction: '내용',
      hobby: '취미',
      id: 3,
    };

    const resume = await resumeRepository.updateResume(mockResumeData);

    expect(resume).toEqual(mockReturn);
    expect(mockPrisma.resume.update).toHaveBeenCalledWith({
      data: mockResumeData,
      where: { id: +mockResumeData.id },
    });
  });

  test('getResumesByUserId', async () => {
    const mockUserId = 3;
    const mockReturn = 'Resume object list';
    mockPrisma.resume.findMany.mockReturnValue(mockReturn);

    const resumes = await resumeRepository.getResumesByUserId(mockUserId);

    expect(resumes).toEqual(mockReturn);
    expect(mockPrisma.resume.findMany).toHaveBeenCalledWith({
      where: { userId: +mockUserId },
    });
  });

  test('getAllResumes', async () => {
    const mockOrderKey = 'createdAt';
    const mockOrderValue = 'asc';
    const mockReturn = 'Resume object list';
    mockPrisma.resume.findMany.mockReturnValue(mockReturn);

    const resumes = await resumeRepository.getAllResumes(
      mockOrderKey,
      mockOrderValue
    );

    expect(resumes).toEqual(mockReturn);
    expect(mockPrisma.resume.findMany).toHaveBeenCalledWith({
      orderBy: { [mockOrderKey]: mockOrderValue },
    });
  });

  test('updateResumeStatus', async () => {
    const mockResumeId = 3;
    const mockStatus = 'INTERVIEW1';
    const mockReturn = 'Resume object';
    mockPrisma.resume.update.mockReturnValue(mockReturn);

    const resume = await resumeRepository.updateResumeStatus(
      mockResumeId,
      mockStatus
    );

    expect(resume).toEqual(mockReturn);
    expect(mockPrisma.resume.update).toHaveBeenCalledWith({
      where: { id: +mockResumeId },
      data: { status: mockStatus },
    });
  });
});
