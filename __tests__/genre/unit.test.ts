import * as service from '../../src/entities/genre/service/index.js';
import * as validator from '../../src/entities/genre/validator.js';

import {
  after,
  assert,
  before,
  createHttpMocks,
  HTTP_STATUS_CODES,
  initServer,
  mockLogger,
  MRSError,
  randomString,
  randomUUID,
  suite,
  terminateServer,
  test,
  VALIDATION,
  type LoggerHandler,
  type ResponseWithCtx,
  type ServerParams,
} from '../utils.js';

import { seedGenre, seedGenres } from './utils.js';

/**********************************************************************************/

const { GENRE } = VALIDATION;

/**********************************************************************************/

await suite('Genre unit tests', async () => {
  let logger: LoggerHandler = null!;
  let serverParams: ServerParams = null!;
  before(async () => {
    ({ logger } = mockLogger());
    serverParams = await initServer();
  });
  after(() => {
    terminateServer(serverParams);
  });

  await suite('Create', async () => {
    await suite('Validation layer', async () => {
      await suite('Name', async () => {
        await test('Missing', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
          });

          const validateCreateGenreSpy = ctx.mock.fn(
            validator.validateCreateGenre,
          );

          assert.throws(
            () => {
              validateCreateGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.NAME.REQUIRED_ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
        await test('Empty', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              body: {
                name: '',
              },
            },
          });

          const validateCreateGenreSpy = ctx.mock.fn(
            validator.validateCreateGenre,
          );

          assert.throws(
            () => {
              validateCreateGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.NAME.MIN_LENGTH.ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
        await test('Too short', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              body: {
                name: 'a'.repeat(GENRE.NAME.MIN_LENGTH.VALUE - 1),
              },
            },
          });

          const validateCreateGenreSpy = ctx.mock.fn(
            validator.validateCreateGenre,
          );

          assert.throws(
            () => {
              validateCreateGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.NAME.MIN_LENGTH.ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
        await test('Too long', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              body: {
                name: 'a'.repeat(GENRE.NAME.MAX_LENGTH.VALUE + 1),
              },
            },
          });

          const validateCreateGenreSpy = ctx.mock.fn(
            validator.validateCreateGenre,
          );

          assert.throws(
            () => {
              validateCreateGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.NAME.MAX_LENGTH.ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
      });
    });
    await suite('Service layer', async () => {
      await test('Duplicate', async () => {
        await seedGenre(serverParams, async (genre) => {
          const context = {
            authentication: serverParams.authentication,
            database: serverParams.database,
            logger,
          };
          const genreToCreate = { name: genre.name };

          await assert.rejects(
            async () => {
              await service.createGenre(context, genreToCreate);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.CONFLICT,
                message: `Genre '${genre.name}' already exists`,
              });

              return true;
            },
          );
        });
      });
    });
  });
  await suite('Update', async () => {
    await suite('Validation layer', async () => {
      await test('No updates', (ctx) => {
        const { request } = createHttpMocks<ResponseWithCtx>({
          logger,
          reqOptions: {
            params: {
              genreId: randomUUID(),
            },
          },
        });

        const validateUpdateGenreSpy = ctx.mock.fn(
          validator.validateUpdateGenre,
        );

        assert.throws(
          () => {
            validateUpdateGenreSpy(request);
          },
          (err) => {
            assert.strictEqual(err instanceof MRSError, true);
            assert.deepStrictEqual((err as MRSError).getClientError(), {
              code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
              message: GENRE.NO_FIELDS_TO_UPDATE_ERROR_MESSAGE,
            });

            return true;
          },
        );
      });
      await suite('Id', async () => {
        await test('Missing', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              body: {
                name: randomString(),
              },
            },
          });

          const validateUpdateGenreSpy = ctx.mock.fn(
            validator.validateUpdateGenre,
          );

          assert.throws(
            () => {
              validateUpdateGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.ID.REQUIRED_ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
        await test('Empty', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              params: {
                genreId: '',
              },
              body: {
                name: randomString(),
              },
            },
          });

          const validateUpdateGenreSpy = ctx.mock.fn(
            validator.validateUpdateGenre,
          );

          assert.throws(
            () => {
              validateUpdateGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.ID.ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
        await test('Invalid', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              params: {
                genreId: randomString(),
              },
              body: {
                name: randomString(),
              },
            },
          });

          const validateUpdateGenreSpy = ctx.mock.fn(
            validator.validateUpdateGenre,
          );

          assert.throws(
            () => {
              validateUpdateGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.ID.ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
      });
      await suite('Name', async () => {
        await test('Empty', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              params: {
                genreId: randomUUID(),
              },
              body: {
                name: '',
              },
            },
          });

          const validateUpdateGenreSpy = ctx.mock.fn(
            validator.validateUpdateGenre,
          );

          assert.throws(
            () => {
              validateUpdateGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.NAME.MIN_LENGTH.ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
        await test('Too short', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              params: {
                genreId: randomUUID(),
              },
              body: {
                name: 'a'.repeat(GENRE.NAME.MIN_LENGTH.VALUE - 1),
              },
            },
          });

          const validateUpdateGenreSpy = ctx.mock.fn(
            validator.validateUpdateGenre,
          );

          assert.throws(
            () => {
              validateUpdateGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.NAME.MIN_LENGTH.ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
        await test('Too long', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              params: {
                genreId: randomUUID(),
              },
              body: {
                name: 'a'.repeat(GENRE.NAME.MAX_LENGTH.VALUE + 1),
              },
            },
          });

          const validateUpdateGenreSpy = ctx.mock.fn(
            validator.validateUpdateGenre,
          );

          assert.throws(
            () => {
              validateUpdateGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.NAME.MAX_LENGTH.ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
      });
    });
    await suite('Service layer', async () => {
      await test('Duplicate', async () => {
        await seedGenres(serverParams, 2, async (genres) => {
          const context = {
            authentication: serverParams.authentication,
            database: serverParams.database,
            logger,
          };
          const genreToUpdate = {
            genreId: genres[0]!.id,
            name: genres[1]!.name,
          };

          await assert.rejects(
            async () => {
              await service.updateGenre(context, genreToUpdate);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.CONFLICT,
                message: `Genre '${genres[1]!.name}' already exists`,
              });

              return true;
            },
          );
        });
      });
    });
  });
  await suite('Delete', async () => {
    await suite('Validation layer', async () => {
      await suite('Id', async () => {
        await test('Missing', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
          });

          const validateDeleteGenreSpy = ctx.mock.fn(
            validator.validateDeleteGenre,
          );

          assert.throws(
            () => {
              validateDeleteGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.ID.REQUIRED_ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
        await test('Empty', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              params: {
                genreId: '',
              },
            },
          });

          const validateDeleteGenreSpy = ctx.mock.fn(
            validator.validateDeleteGenre,
          );

          assert.throws(
            () => {
              validateDeleteGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.ID.ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
        await test('Invalid', (ctx) => {
          const { request } = createHttpMocks<ResponseWithCtx>({
            logger,
            reqOptions: {
              params: {
                genreId: randomString(),
              },
            },
          });

          const validateDeleteGenreSpy = ctx.mock.fn(
            validator.validateDeleteGenre,
          );

          assert.throws(
            () => {
              validateDeleteGenreSpy(request);
            },
            (err) => {
              assert.strictEqual(err instanceof MRSError, true);
              assert.deepStrictEqual((err as MRSError).getClientError(), {
                code: HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: GENRE.ID.ERROR_MESSAGE,
              });

              return true;
            },
          );
        });
      });
    });
  });
});
