export default class PermissionError extends Error {
  constructor(message = 'no permission') {
    super(message);
    this.name = 'PermissionError';
    this.statusCode = 403;
  }
}
