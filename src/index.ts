import { FastifyRequest, FastifyReply } from 'fastify'
import { ServerResponse } from 'http'
import fp from 'fastify-plugin'

function errorHandler(error: any, request: FastifyRequest, reply: FastifyReply<ServerResponse>) {
  const statusCode = error.validation ? 400 : reply.httpCodes[error.type] || error.statusCode || 500
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
        details: error.validation || error.details,
      }
    : {
        error: error.type,
        message: 'Something went wrong. Try again later.',
        statusCode,
      }

  reply.code(statusCode).send(response)
}

interface Codes {
  [key: string]: number
}

export interface InterferencePluginOptions {
  codes?: Codes
}

export default fp(
  async function interferencePlugin(fastify, opts: InterferencePluginOptions = {}) {
    fastify.setErrorHandler(errorHandler)
    fastify.decorateReply('httpCodes', opts.codes ?? {})
  },
  {
    name: 'interference-fastify-plugin',
    fastify: '^2.0.0',
  },
)
declare module 'fastify' {
  type HttpResponse = ServerResponse
  interface FastifyReply<HttpResponse> {
    httpCodes: Codes
  }
}
