export default function (err, req, res, next) {
  console.error(err.statusCode);
  if (err.name === 'ValidationError') {
    res.status(412).send(err.details[0].message); // joi에서 에러가 발생했을때 메시지 그대로 반환){
  } else if (err.name === 'NotFoundError') {
    res.status(404).send(err.message);
  } else if (err.name === 'PermissionError') {
    res.status(403).send(err.message);
  } else if (err.name === 'BadRequestError') {
    res.status(400).send(err.message);
  } else {
    res.status(500).send(`Internal Server Error....${err.message}`);
  }
}
