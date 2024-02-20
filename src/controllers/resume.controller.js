export class ResumeController {
  constructor(resumeService) {
    this.resumeService = resumeService;
  }

  /** 이력서 생성 API */
  createResume = async (req, res, next) => {
    try {
      const resumeData = req.body;
      resumeData.userId = +req.userId;
      const resume = await this.resumeService.createResume(resumeData);
      return res.status(201).json({ resume });
    } catch (err) {
      next(err);
    }
  };

  /** 이력서 삭제 API */
  deleteResume = async (req, res, next) => {
    try {
      const { resumeId } = req.params;
      await this.resumeService.deleteResume(resumeId, req.userId);
      res.status(200).send('이력서가 삭제되었습니다.');
    } catch (err) {
      next(err);
    }
  };

  /** 이력서 수정 API */
  updateResume = async (req, res, next) => {
    try {
      const { resumeId } = req.params;
      const resumeData = req.body;
      resumeData.id = +resumeId;
      resumeData.userId = +req.userId;
      const resume = await this.resumeService.updateResume(resumeData);
      return res.status(201).json({ resume });
    } catch (err) {
      next(err);
    }
  };

  /** 내 이력서 전체 조회 API */
  getMyResumes = async (req, res, next) => {
    try {
      const resumes = await this.resumeService.getResumesByUserId(req.userId);
      return res.status(200).json({ resumes });
    } catch (err) {
      next(err);
    }
  };

  /** 이력서 상세 조회 API (사용자는 본인의 이력서만, 인사담당자는 전부 열람 가능) */
  getResume = async (req, res, next) => {
    try {
      const { resumeId } = req.params;
      const resume = await this.resumeService.getResume(
        resumeId,
        req.userId,
        req.role
      );
      return res.status(200).json({ resume });
    } catch (err) {
      next(err);
    }
  };

  /** 모든 이력서 목록 조회 API (인사담당자만 가능) */
  getAllResumes = async (req, res, next) => {
    try {
      const { orderKey, orderValue } = req.query;
      const resumes = await this.resumeService.getAllResumes(
        orderKey,
        orderValue
      );
      return res.status(200).json({ resumes });
    } catch (err) {
      next(err);
    }
  };

  /** 이력서의 상태(status)'만' 변경 API (인사담당자만 가능) */
  changeResumeStatus = async (req, res, next) => {
    try {
      const { resumeId } = req.params;
      const { status } = req.body;
      const resume = await this.resumeService.updateResumeStatus(
        resumeId,
        status
      );
      return res.status(200).json({ resume });
    } catch (err) {
      next(err);
    }
  };
}
