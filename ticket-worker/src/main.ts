import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';

import {
  ConsumerStatus,
  type AsyncMessage,
  type Publisher,
} from 'rabbitmq-client';

import { ERROR_CODES, MESSAGE_QUEUE, SIGNALS } from './constants.ts';
import MessageQueue from './message.queue.ts';

/**********************************************************************************/

type TicketReservationsParams = {
  userShowtimeId: string;
  userDetails: { id: string; email: string };
  movieDetails: {
    hallName: string;
    movieTitle: string;
    price: number;
    at: Date;
    row: number;
    column: number;
  };
};
type TicketCancellationParams = {
  showtimeId: string;
  userIds: string | string[];
};

/**********************************************************************************/

function startWorker() {
  const messageQueueUrl = process.env.MESSAGE_QUEUE_URL;
  if (!messageQueueUrl) {
    throw new Error('Missing message queue url');
  }

  // See: https://nodejs.org/api/events.html#capture-rejections-of-promises
  EventEmitter.captureRejections = true;

  const messageQueue = new MessageQueue({
    url: process.env.MESSAGE_QUEUE_URL!,
  });

  const publisher = messageQueue.createPublishers({
    ticket: {
      confirm: true,
      maxAttempts: 32,
      routing: [
        {
          exchange: MESSAGE_QUEUE.TICKET.RESERVE.CLIENT.EXCHANGE_NAME,
          queue: MESSAGE_QUEUE.TICKET.RESERVE.CLIENT.QUEUE_NAME,
          routingKey: MESSAGE_QUEUE.TICKET.RESERVE.CLIENT.ROUTING_KEY_NAME,
        },
        {
          exchange: MESSAGE_QUEUE.TICKET.CANCEL.CLIENT.EXCHANGE_NAME,
          queue: MESSAGE_QUEUE.TICKET.CANCEL.CLIENT.QUEUE_NAME,
          routingKey: MESSAGE_QUEUE.TICKET.CANCEL.CLIENT.ROUTING_KEY_NAME,
        },
      ],
    },
  });
  messageQueue.createConsumer({
    routing: {
      exchange: MESSAGE_QUEUE.TICKET.RESERVE.SERVER.EXCHANGE_NAME,
      queue: MESSAGE_QUEUE.TICKET.RESERVE.SERVER.QUEUE_NAME,
      routingKey: MESSAGE_QUEUE.TICKET.RESERVE.SERVER.ROUTING_KEY_NAME,
    },
    handler: reserveTicket(publisher.ticket!),
  });
  messageQueue.createConsumer({
    routing: {
      exchange: MESSAGE_QUEUE.TICKET.CANCEL.SERVER.EXCHANGE_NAME,
      queue: MESSAGE_QUEUE.TICKET.CANCEL.SERVER.QUEUE_NAME,
      routingKey: MESSAGE_QUEUE.TICKET.CANCEL.SERVER.ROUTING_KEY_NAME,
    },
    handler: cancelTicket(publisher.ticket!),
  });

  attachProcessHandlers(messageQueue);
}

/**********************************************************************************/

function reserveTicket(ticketPublisher: Publisher) {
  return async (
    message: Omit<AsyncMessage, 'body'> & { body: TicketReservationsParams },
  ) => {
    const { correlationId, replyTo, body } = message;

    if (!replyTo || !correlationId) {
      return ConsumerStatus.DROP;
    }
    const { userShowtimeId, userDetails, movieDetails } = body;

    // TODO Payment processing
    const transactionId = randomUUID();

    // TODO Send email receipt
    console.log(userShowtimeId, userDetails, movieDetails);

    await ticketPublisher.send(
      {
        durable: true,
        mandatory: true,
        correlationId,
        contentType: 'application/json',
        routingKey: replyTo,
      },
      { userShowtimeId, transactionId },
    );

    return ConsumerStatus.ACK;
  };
}

function cancelTicket(ticketPublisher: Publisher) {
  return async (
    message: Omit<AsyncMessage, 'body'> & { body: TicketCancellationParams },
  ) => {
    const { correlationId, replyTo, body } = message;

    if (!replyTo || !correlationId) {
      return ConsumerStatus.DROP;
    }
    const { showtimeId, userIds } = body;

    // TODO Refund processing
    console.log(showtimeId, userIds);

    await ticketPublisher.send(
      {
        durable: true,
        mandatory: true,
        correlationId,
        contentType: 'application/json',
        routingKey: replyTo,
      },
      { showtimeId, userIds },
    );

    return ConsumerStatus.ACK;
  };
}

/**********************************************************************************/

function signalHandler(messageQueue: MessageQueue) {
  return () => {
    messageQueue
      .close()
      .catch((err: unknown) => {
        console.error(err);
      })
      .finally(() => {
        process.exit(ERROR_CODES.EXIT_NO_RESTART);
      });
  };
}

function globalErrorHandler(
  messageQueue: MessageQueue,
  reason: 'exception' | 'rejection',
) {
  return (err: unknown) => {
    console.error(err, `Unhandled ${reason}`);

    messageQueue
      .close()
      .catch((err: unknown) => {
        console.error(err);
      })
      .finally(() => {
        // See: https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html#error-exception-handling
        process.exit(ERROR_CODES.EXIT_RESTART);
      });
  };
}

function attachProcessHandlers(messageQueue: MessageQueue) {
  process
    .on('warning', console.warn)
    .once('unhandledRejection', globalErrorHandler(messageQueue, 'rejection'))
    .once('uncaughtException', globalErrorHandler(messageQueue, 'exception'));

  SIGNALS.forEach((signal) => {
    process.once(signal, signalHandler(messageQueue));
  });
}

/**********************************************************************************/

startWorker();
