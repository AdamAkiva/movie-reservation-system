import pg from 'postgres';

import {
  ERROR_CODES,
  HTTP_STATUS_CODES,
  MRSError,
} from '../../../utils/index.js';

import type {
  validateCancelUserShowtimeReservation,
  validateCreateShowtime,
  validateDeleteShowtime,
  validateGetShowtimes,
  validateReserveShowtimeTicket,
} from '../validator.js';

/**********************************************************************************/

type GetShowtimeValidatedData = ReturnType<typeof validateGetShowtimes>;
type CreateShowtimeValidatedData = ReturnType<typeof validateCreateShowtime>;
type DeleteShowtimeValidatedData = ReturnType<typeof validateDeleteShowtime>;
type ReserveShowtimeTicketValidatedData = ReturnType<
  typeof validateReserveShowtimeTicket
>;
type CancelUserShowtimeValidatedData = ReturnType<
  typeof validateCancelUserShowtimeReservation
>;

type Showtime = {
  id: string;
  at: Date;
  reservations: [number, number][];
  movieTitle: string;
  hallName: string;
};

type ShowtimeTicket = {
  hallName: string;
  movieTitle: string;
  at: Date;
  row: number;
  column: number;
};

/**********************************************************************************/

function handlePossibleDuplicationError(params: {
  err: unknown;
  showtime: Date;
  hall: string;
}) {
  const { err, showtime, hall } = params;

  if (
    err instanceof pg.PostgresError &&
    err.code === ERROR_CODES.POSTGRES.UNIQUE_VIOLATION
  ) {
    return new MRSError(
      HTTP_STATUS_CODES.CONFLICT,
      `A showtime at '${showtime.toISOString()}' in '${hall}' already exists`,
      err.cause,
    );
  }

  return err;
}

/**********************************************************************************/

export {
  handlePossibleDuplicationError,
  type CancelUserShowtimeValidatedData,
  type CreateShowtimeValidatedData,
  type DeleteShowtimeValidatedData,
  type GetShowtimeValidatedData,
  type ReserveShowtimeTicketValidatedData,
  type Showtime,
  type ShowtimeTicket,
};
