import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

function errorHandler(error: any, request: FastifyRequest, reply: FastifyReply<any>) {
  const statusCode = error.validation ? 400 : error.statusCode || 500
  const isClientError = statusCode >= 400 && statusCode < 500

  if (isClientError) {
    request.log.info(error)
  } else {
    request.log.error(error)
  }

  const response = isClientError
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
}

async function interferencePlugin(fastify: FastifyInstance) {
  fastify.setErrorHandler(errorHandler)
}

export default fp(interferencePlugin, {
  name: 'interference-fastify-plugin',
  fastify: '^2.0.0',
})
