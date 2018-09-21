import fp from 'fastify-plugin'

export const errorHandler = (error: any, req, reply) => {
  if (error.validation) {
    error.type = 'DOCUMENT_VALIDATION_ERROR'
    error.details = error.validation
  }
  const statusCode = error.statusCode || 500
  reply.code(statusCode)

  const response =
    statusCode !== 500
      ? {
          error: error.type,
          message: error.message,
          statusCode,
          details: error.details,
        }
      : {
          error: error.type,
          message: 'Something went wrong. Try again later.',
          statusCode,
        }

  reply.send(response)
}

export default fp(function protovisionPlugin(fastify, _, next) {
  fastify.setErrorHandler(errorHandler)
  next()
})
