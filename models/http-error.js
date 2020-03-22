class HttpError extends Error {
  constructor(msg, errorCode) {
    super(msg);
    this.code = errorCode;
  }
}
module.exports = HttpError;
