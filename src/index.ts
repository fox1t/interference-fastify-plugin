import fp from 'fastify-plugin'
import { FastifyError } from 'fastify'

type InterferenceError = FastifyError & { type: string; details: unknown }

export default fp(function protovisionPlugin(fastify, _, next) {
  fastify.setErrorHandler(function(error: InterferenceError, req, reply) {
    if (error.validation) {
      error.statusCode = 400
      error.type = 'DOCUMENT_VALIDATION_ERROR'
      error.details = error.validation
    }
    const statusCode = error.statusCode || 500

    req.log.error(error)
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

    reply.code(statusCode).send(response)
  })
  next()
})
