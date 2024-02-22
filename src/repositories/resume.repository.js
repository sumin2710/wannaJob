import dataSource from '../typeorm/index.js';

export class ResumeRepository {
  createResume = async (resumeData) => {
    const resume = await dataSource.getRepository('Resume').save(resumeData);
    return resume;
  };

  getResumeById = async (resumeId) => {
    const resume = await dataSource.getRepository('Resume').findOne({
      where: { id: +resumeId },
    });
    return resume;
  };

  deleteResume = async (resumeId) => {
    await dataSource.getRepository('Resume').delete({
      id: +resumeId,
    });
    return;
  };

  updateResume = async (resumeData) => {
    await dataSource.getRepository('Resume').update(
      {
        id: +resumeData.id,
      },
      resumeData
    );
  };

  getResumesByUserId = async (userId) => {
    const resumes = await dataSource.getRepository('Resume').find({
      where: { userId: +userId },
    });
    return resumes;
  };

  getAllResumes = async (orderKey, orderValue) => {
    const resumes = await dataSource.getRepository('Resume').find({
      order: { [orderKey]: orderValue },
    });
    return resumes;
  };

  updateResumeStatus = async (resumeId, status) => {
    await dataSource.getRepository('Resume').update(
      {
        id: +resumeId,
      },
      { status: status }
    );
  };
}
