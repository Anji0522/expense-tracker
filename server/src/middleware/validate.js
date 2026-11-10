export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse(req.body)
    req.body = parsed
    next()
  } catch (error) {
    const issues = error.issues || error.errors
    if (issues && Array.isArray(issues)) {
      const messages = issues.map(err => err.message).join(', ')
      return res.status(400).json({
        success: false,
        message: messages,
        errors: issues,
      })
    }
    return res.status(400).json({
      success: false,
      message: error.message || 'Validation error',
    })
  }
}

export default validate
