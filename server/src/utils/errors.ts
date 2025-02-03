/* eslint-disable max-classes-per-file */

import { inspect } from 'node:util';

import type { Response } from 'express';

import { HTTP_STATUS_CODES } from './constants.ts';

/**********************************************************************************/

type PossibleUnauthenticatedErrors = ['missing', 'malformed', 'expired'];

/**********************************************************************************/

class GeneralError extends Error {
  readonly #message;
  readonly #statusCode;

  public constructor(statusCode: number, message: string, cause?: unknown) {
    super(message);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.cause = cause;
    this.#statusCode = statusCode;
    this.#message = message;
  }

  public [inspect.custom]() {
    const stackTrace = this.stack
      ? `\nStack trace:\n${this.stack.split('\n').slice(1).join('\n')}`
      : '';

    let logMessage = `${this.#statusCode}: ${this.#message}${stackTrace}`;
    if (this.cause && this.cause instanceof Error) {
      logMessage += `\n[cause]: ${GeneralError.#formatError(this.cause)}`;
    }

    return logMessage;
  }

  // The unused variable exists to allow overrides of child classes
  // eslint-disable-next-line no-unused-vars
  public getClientError(_res: Response) {
    return {
      code: this.#statusCode,
      message: this.#message,
    } as const;
  }

  /********************************************************************************/

  static #formatError(err: Error) {
    const header = `${err.name} - ${err.message}`;
    const stackTrace = err.stack
      ? `\nStack trace:\n${err.stack.split('\n').slice(1).join('\n')}`
      : '';
    // The function must have a return type to allow tsc to evaluate the recursion
    // correctly. See: https://github.com/microsoft/TypeScript/issues/43047
    const nestedCause: string =
      err.cause && err.cause instanceof Error
        ? `\n[cause]: ${this.#formatError(err.cause)}`
        : '';

    const formattedError = `${header}${stackTrace}${nestedCause}`;

    return formattedError;
  }
}

/**********************************************************************************/

class UnauthorizedError extends GeneralError {
  // See: https://datatracker.ietf.org/doc/html/rfc6750#section-3
  static readonly #realm = 'Bearer realm="movie_reservation_system"';
  static readonly #errors: {
    // eslint-disable-next-line no-unused-vars
    [K in PossibleUnauthenticatedErrors[number]]: string;
  } = {
    missing: UnauthorizedError.#realm,
    malformed: `${UnauthorizedError.#realm}, error="invalid_token", error_description="Malformed access token"`,
    expired: `${UnauthorizedError.#realm}, error="invalid_token", error_description="The access token expired"`,
  } as const;

  readonly #reason;

  public constructor(
    reason: PossibleUnauthenticatedErrors[number],
    cause?: unknown,
  ) {
    super(HTTP_STATUS_CODES.UNAUTHORIZED, 'Unauthorized', cause);
    Error.captureStackTrace(this, this.constructor);

    this.name = this.constructor.name;
    this.#reason = reason;
  }

  public override getClientError(res: Response) {
    res.setHeader('WWW-Authenticate', this.#getWWWAuthenticateHeaderValue());

    return super.getClientError(res);
  }

  /********************************************************************************/

  #getWWWAuthenticateHeaderValue() {
    return UnauthorizedError.#errors[this.#reason];
  }
}

/**********************************************************************************/

export { GeneralError, UnauthorizedError };
