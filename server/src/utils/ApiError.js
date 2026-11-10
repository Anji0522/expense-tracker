export class ApiError extends Error {
  constructor(statusCode, message) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ApiError'
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message) {
    return new ApiError(400, message)
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message)
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message)
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message)
  }

  static conflict(message) {
    return new ApiError(409, message)
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, message)
  }
}

export default ApiError
