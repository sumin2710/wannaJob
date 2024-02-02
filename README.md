# 환경변수
- DATABASE_URL
- DATABASE_HOST
- DATABASE_PORT
- DATABASE_NAME
- DATABASE_USERNAME
- DATABASE_PASSWORD
- ACCESS_SECRET_KEY
- REFRESH_SECRET_KEY

# API 명세서 URL
- 구글 Docs 공유 URL 추가

# ERD URL
- https://drawsql.app/teams/sus-team-1/diagrams/wanna-job

# 더 고민해 보기
1. **암호화 방식**
    - 비밀번호를 DB에 저장할 때 Hash를 이용했는데, Hash는 단방향 암호화와 양방향 암호화 중 어떤 암호화 방식에 해당할까요?
      - 단방향 암호화
    - 비밀번호를 그냥 저장하지 않고 Hash 한 값을 저장 했을 때의 좋은 점은 무엇인가요?
      - 유출해도 복호화되지 않아서 보안의 리스크가 적다

2. **인증 방식**
    - JWT(Json Web Token)을 이용해 인증 기능을 했는데, 만약 Access Token이 노출되었을 경우 발생할 수 있는 문제점은 무엇일까요?
      - 서버에서 토큰이 탈취되었는지 알 수가 없고 관리또한 할 수 없다.
    - 해당 문제점을 보완하기 위한 방법으로는 어떤 것이 있을까요?
      - Refresh Token을 따로 발급해서 DB에 저장해서 검증한다. 

3. **인증과 인가**
    - 인증과 인가가 무엇인지 각각 설명해 주세요.
      - 인증이란 사용자의 신원을 검증하는 것이고, 인가란 인증 이후의 프로세스로 인증된 사용자에게 특정 리소스나 기능에 액세스 가능한 권한을 부여하는 것이다.
    - 과제에서 구현한 Middleware는 인증에 해당하나요? 인가에 해당하나요? 그 이유도 알려주세요.
      - 인증, 사용자가 로그인 한 사용자인지 검증하는 것이기 때문이다.

4. **Http Status Code**
    - 과제를 진행하면서 사용한 Http Status Code를 모두 나열하고, 각각이 의미하는 것과 어떤 상황에 사용했는지 작성해 주세요.
      - 200 : 성공적으로 완료됨
      - 201 : 성공적으로 생성됨
      - 400 : bad request. 잘못된 사용자 요청
      - 401 : unauthorized. 허가되지 않은 사용자.
      - 404 : not found. 요청한 리소스가 존재하지 않음
      - 412 : 요청이 서버 조건과 일치하지 않음

5. **리팩토링**
    - MySQL, Prisma로 개발했는데 MySQL을 MongoDB로 혹은 Prisma 를 TypeORM 로 변경하게 된다면 많은 코드 변경이 필요할까요? 주로 어떤 코드에서 변경이 필요한가요?
      - 라우터 부분에서 변경이 많이 필요할 것 같다. 
    - 만약 이렇게 DB를 변경하는 경우가 또 발생했을 때, 코드 변경을 보다 쉽게 하려면 어떻게 코드를 작성하면 좋을 지 생각나는 방식이 있나요? 있다면 작성해 주세요.

6. **API 명세서**
    - notion 혹은 엑셀에 작성하여 전달하는 것 보다 swagger 를 통해 전달하면 장점은 무엇일까요?
      - swagger ui로 직접 코드를 실행하고 그 결과를 볼 수 있다. 
