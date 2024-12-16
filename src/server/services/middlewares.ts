import {
  ERROR_CODES,
  HTTP_STATUS_CODES,
  MRSError,
  pg,
  type NextFunction,
  type Request,
  type RequestContext,
  type ResponseWithContext,
  type ResponseWithoutContext,
} from '../../utils/index.js';

/**********************************************************************************/

function checkMethod(allowedMethods: Set<string>) {
  return (req: Request, res: ResponseWithoutContext, next: NextFunction) => {
    if (!allowedMethods.has(req.method.toUpperCase())) {
      // Reason for explicitly adding the header:
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Allow
      res
        .set('Allow', Array.from(allowedMethods).join(', '))
        .status(HTTP_STATUS_CODES.NOT_ALLOWED)
        .end();
      return;
    }

    next();
  };
}

function attachContext(requestContext: RequestContext) {
  return (_: Request, res: ResponseWithContext, next: NextFunction) => {
    res.locals.context = requestContext;

    next();
  };
}

function handleNonExistentRoute(req: Request, res: ResponseWithoutContext) {
  res
    .status(HTTP_STATUS_CODES.NOT_FOUND)
    .json(`The route '${req.url}' does not exist`);
}

function errorHandler(
  err: unknown,
  _: Request,
  res: ResponseWithContext,
  next: NextFunction,
) {
  if (res.headersSent) {
    next(err);
    return;
  }

  // The order is based on two things, type fallback and the chances of each error
  // happening. For example, TGMS error should be the most common error reason,
  // and it should be the first from that perspective
  if (err instanceof MRSError) {
    const { code, message } = err.getClientError();

    res.locals.context.logger.warn(err);
    res.status(code).json(message);
    return;
  }
  if (
    err instanceof Object &&
    'type' in err &&
    err.type === 'entity.too.large'
  ) {
    res
      .status(HTTP_STATUS_CODES.CONTENT_TOO_LARGE)
      .json('Request entity too large');
    return;
  }
  if (err instanceof pg.PostgresError) {
    handlePostgresError(err, res);
    return;
  }

  handleUnexpectedError(err, res);
}

/**********************************************************************************/

function handlePostgresError(err: pg.PostgresError, res: ResponseWithContext) {
  const { FOREIGN_KEY_VIOLATION, UNIQUE_VIOLATION, TOO_MANY_CONNECTIONS } =
    ERROR_CODES.POSTGRES;
  const { logger } = res.locals.context;

  switch (err.code) {
    case FOREIGN_KEY_VIOLATION:
    case UNIQUE_VIOLATION:
      logger.fatal(
        err,
        'Should have been handled by the code and never get here. Check the' +
          ' code implementation',
      );
      break;
    case TOO_MANY_CONNECTIONS:
      logger.fatal(
        err,
        'Exceeded database maximum connections.\nThis Should never happen,' +
          ' check the server and database logs to understand why it happened',
      );
      break;
    default:
      logger.fatal(err, 'Unexpected database error');
      break;
  }

  res
    .status(HTTP_STATUS_CODES.SERVER_ERROR)
    .json('Unexpected error, please try again');
}

function handleUnexpectedError(err: unknown, res: ResponseWithContext) {
  const { logger } = res.locals.context;

  if (err instanceof Error) {
    logger.fatal(err, 'Unhandled exception');
  } else {
    logger.fatal(err, 'Caught a non-error object.\nThis should never happen');
  }

  res
    .status(HTTP_STATUS_CODES.SERVER_ERROR)
    .json('Unexpected error, please try again');
}

/**********************************************************************************/

export { attachContext, checkMethod, errorHandler, handleNonExistentRoute };
