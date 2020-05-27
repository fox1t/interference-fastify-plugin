import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import { isInterference } from 'interference'

function errorHandler(
  this: FastifyInstance,
  error: any,
  request: FastifyRequest,
  reply: FastifyReply<any>,
) {
  const statusCode: number = isInterference(error)
    ? error.statusCode || this.interference.get(error.type) || 500
    : error.validation
    ? 400
    : 500

  const isClientError = statusCode >= 400 && statusCode < 500

  if (isClientError) {
    request.log.info({ ...error, statusCode })
  } else {
    request.log.error({ ...error, statusCode })
  }

  let response: any
  if (isInterference(error) && isClientError) {
    response = {
      error: error.type,
      message: error.message,
      details: error.details,
      statusCode,
    }
  } else if (error.validation) {
    response = {
      error: 'INVALID_REQUEST',
      message: error.message,
      details: error.validation,
      statusCode,
    }
  } else {
    response = {
      error: 'INTERNAL_ERROR',
      message: 'An error occurred',
      details: {},
      statusCode,
    }
  }

  reply.code(statusCode).send(response)
}

export default fp(
  async function interferencePlugin(fastify) {
    fastify.decorate('interference', new Map<string, number>())
    fastify.setErrorHandler(errorHandler.bind(fastify))
  },
  {
    name: 'interference-fastify-plugin',
    fastify: '^2.0.0',
  },
)

declare module 'fastify' {
  interface FastifyInstance {
    interference: Map<string, number>
  }
}
