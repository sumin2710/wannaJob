export class ResumeRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  createResume = async (resumeData) => {
    const newResume = await this.prisma.resume.create({
      data: {
        ...resumeData,
      },
    });
    return newResume;
  };

  getResumeById = async (resumeId) => {
    const resume = await this.prisma.resume.findUnique({
      where: { id: +resumeId },
    });
    return resume;
  };

  deleteResume = async (resumeId) => {
    await this.prisma.resume.delete({
      where: { id: +resumeId },
    });
    return;
  };

  updateResume = async (resumeData) => {
    const resume = await this.prisma.resume.update({
      data: { ...resumeData },
      where: { id: +resumeData.id },
    });
    return resume;
  };

  getResumesByUserId = async (userId) => {
    const resumes = await this.prisma.resume.findMany({
      where: { userId: +userId },
    });
    return resumes;
  };

  getAllResumes = async (orderKey, orderValue) => {
    const resumes = await this.prisma.resume.findMany({
      orderBy: { [orderKey]: orderValue },
    });
    return resumes;
  };

  updateResumeStatus = async (resumeId, status) => {
    const resume = await this.prisma.resume.update({
      where: { id: +resumeId },
      data: { status: status },
    });
    return resume;
  };
}
