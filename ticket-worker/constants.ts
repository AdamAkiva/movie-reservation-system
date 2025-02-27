const HTTP_STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  MOVED_PERMANENTLY: 301,
  REDIRECT: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  CONTENT_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  GATEWAY_TIMEOUT: 504,
} as const;

const SIGNALS = [
  "SIGHUP",
  "SIGINT",
  "SIGQUIT",
  "SIGILL",
  "SIGTRAP",
  "SIGABRT",
  "SIGBUS",
  "SIGFPE",
  "SIGSEGV",
  "SIGUSR2",
  "SIGTERM",
] as const;

const ERROR_CODES = {
  // See: https://www.postgresql.org/docs/current/errcodes-appendix.html
  POSTGRES: {
    FOREIGN_KEY_VIOLATION: "23503",
    UNIQUE_VIOLATION: "23505",
    TOO_MANY_CONNECTIONS: "53300",
  },
  // Indicator to the deployment orchestration service to not attempt to restart
  // the service, since the error is a result of a programmer error, and therefore
  // the application should not restart by default
  EXIT_RESTART: 1,
  EXIT_NO_RESTART: 180,
} as const;

const MESSAGE_QUEUE = {
  TICKET: {
    RESERVE: {
      CLIENT: {
        EXCHANGE_NAME: "mrs",
        QUEUE_NAME: "mrs.ticket.reserve.reply.to",
        ROUTING_KEY_NAME: "mrs-ticket-reserve-reply-to",
      },
      SERVER: {
        EXCHANGE_NAME: "mrs",
        QUEUE_NAME: "mrs.ticket.reserve",
        ROUTING_KEY_NAME: "mrs-ticket-reserve",
      },
      CORRELATION_ID: "reserve",
    },
    CANCEL: {
      CLIENT: {
        EXCHANGE_NAME: "mrs",
        QUEUE_NAME: "mrs.ticket.cancel.reply.to",
        ROUTING_KEY_NAME: "mrs-ticket-cancel-reply-to",
      },
      SERVER: {
        EXCHANGE_NAME: "mrs",
        QUEUE_NAME: "mrs.ticket.cancel",
        ROUTING_KEY_NAME: "mrs-ticket-cancel",
      },
      CORRELATION_ID: "cancel",
    },
  },
} as const;

/**********************************************************************************/

export { ERROR_CODES, HTTP_STATUS_CODES, MESSAGE_QUEUE, SIGNALS };
