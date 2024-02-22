export class AdminController {
  constructor(adminService) {
    this.adminService = adminService;
  }

  /** 관리자나 인사담당자 계정으로 승급 API (관리자만 가능) */
  upgradeUserRole = async (req, res, next) => {
    try {
      const { role } = req.body;
      const { userId } = req.params;
      const user = await this.adminService.upgradeUserRole(role, userId);
      return res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  };

  /** 사용자 계정 삭제 API */
  deleteUser = async (req, res, next) => {
    try {
      const { userId } = req.params;
      await this.adminService.deleteUser(userId);
      res.status(200).send(`${userId} 사용자가 삭제되었습니다.`);
    } catch (err) {
      next(err);
    }
  };

  /** 사용자 목록 전체 조회 API */
  getAllUsers = async (req, res, next) => {
    try {
      const users = await this.adminService.getAllUsers();
      return res.status(200).json({ users });
    } catch (err) {
      next(err);
    }
  };
}
