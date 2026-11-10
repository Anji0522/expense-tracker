export const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  error.statusCode = 404
  next(error)
}

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || error.status || 500
  console.error('API error:', error.message)

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 && process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message || 'Something went wrong',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error.stack,
    }),
  })
}
