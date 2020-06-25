import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import fp from 'fastify-plugin'
import Interference, { isInterference } from 'interference'

function errorHandler(
  this: FastifyInstance,
  error: any,
  request: FastifyRequest,
  reply: FastifyReply<any>,
) {
  // Handle exotic errors
  if (!(error instanceof Error)) {
    error = Interference({
      type: 'GENERIC_ERROR',
      message: 'An error occurred',
    })
  }

  // Handle JSON schema validation errors
  if (error.validation) {
    error = Interference({
      type: 'VALIDATION_ERROR',
      message: error.message,
      details: error.validation,
      statusCode: this.interference.get('VALIDATION_ERROR') || 400,
    })
  }

  const statusCode: number =
    (isInterference(error)
      ? error.statusCode || this.interference.get(error.type)
      : this.interference.get('GENERIC_ERROR')) || 500
  error.statusCode = statusCode

  const isClientError = statusCode >= 400 && statusCode < 500
  if (isClientError) {
    request.log.info(error)
  } else {
    request.log.error(error)
  }

  let response: any
  if (isInterference(error) && isClientError) {
    response = {
      error: error.type,
      message: error.message,
      details: error.details,
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
  async function interferencePlugin(
    fastify,
    { codes }: { codes: Record<string, number> | Map<string, number> } = {
      codes: new Map<string, number>(),
    },
  ) {
    let errors: Map<string, number>

    if (codes instanceof Map) {
      errors = codes
    } else {
      errors = new Map<string, number>(Object.entries(codes ?? {}))
    }
    fastify.decorate('interference', errors)
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
