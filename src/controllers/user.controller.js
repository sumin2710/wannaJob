export class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  /** 회원가입 API */
  signUp = async (req, res, next) => {
    try {
      const { email, name, password, checkPassword } = req.body;
      const newUser = await this.userService.signUp(
        email,
        name,
        password,
        checkPassword
      );
      return res.status(201).json({ newUser });
    } catch (err) {
      next(err);
    }
  };

  /** 로그인 API */
  signIn = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await this.userService.signIn(
        email,
        password,
        req.ip,
        req.headers['user-agent']
      );
      // session에 refreshToken 저장
      req.session.refreshToken = user.refreshToken;

      // cookie에 accessToken 저장
      res.cookie('accessToken', user.accessToken);

      return res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  };

  /** 로그아웃 */
  logOut = async (req, res, next) => {
    // session 삭제
    req.session.destroy((err) => {
      if (err)
        return res.status(500).send('로그아웃 도중 오류가 발생했습니다.');
    });

    // cookie 삭제
    res.clearCookie('accessToken');

    res.status(200).send('성공적으로 로그아웃되었습니다.');
  };

  /** 내 정보 조회 API */
  getUser = async (req, res, next) => {
    try {
      const userId = req.userId;
      const user = await this.userService.getUserById(userId);

      return res.status(200).json({ user });
    } catch (err) {
      next(err);
    }
  };
  /** 내 정보 수정 API */
  updateUser = async (req, res, next) => {
    try {
      const userData = req.body; // 사용자 입력 데이터
      userData.id = req.userId; // 사용자 유저 아이디
      if (req.file) userData.profileImage = req.file.location; // 사용자 입력 파일 경로
      const updatedUser = await this.userService.updateUser(userData);

      return res.status(200).json({ updatedUser });
    } catch (err) {
      next(err);
    }
  };
}
