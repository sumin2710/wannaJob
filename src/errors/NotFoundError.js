export default class NotFoundError extends Error {
  constructor(message = 'resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}
