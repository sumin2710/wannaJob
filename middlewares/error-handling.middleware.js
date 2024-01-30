export default function (err, req, res, next) {
  console.error(err);
  if (err.name === 'ValidationError') {
    return res.status(412).json({ message: err.message }); // joi에서 에러가 발생했을때 메시지 그대로 반환){
  }
  // !!!!수정사항!!!! : 특정 상태 코드를 err 처리 미들웨어에 전달해 커스텀하게 res 반환하게
  // response에 err 정보 저장하기
  res.status(500).json({ message: '서버 내부에서 에러가 발생했습니다.' });
}
