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
  type ResponseWithContext,
  type ServerParams,
} from '../utils.js';

import {
  deleteGenres,
  seedGenre,
  seedGenres,
  serviceFunctions,
  validationFunctions,
} from './utils.js';

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

  await test('Invalid - Create validation: Missing name', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
    });

    const validateCreateGenreSpy = context.mock.fn(
      validationFunctions.validateCreateGenre,
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
  await test('Invalid - Create validation: Empty name', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        body: {
          name: '',
        },
      },
    });

    const validateCreateGenreSpy = context.mock.fn(
      validationFunctions.validateCreateGenre,
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
  await test('Invalid - Create validation: Name too short', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        body: {
          name: randomString(GENRE.NAME.MIN_LENGTH.VALUE - 1),
        },
      },
    });

    const validateCreateGenreSpy = context.mock.fn(
      validationFunctions.validateCreateGenre,
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
  await test('Invalid - Create validation: Name too long', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        body: {
          name: randomString(GENRE.NAME.MAX_LENGTH.VALUE + 1),
        },
      },
    });

    const validateCreateGenreSpy = context.mock.fn(
      validationFunctions.validateCreateGenre,
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
  await test('Invalid - Create service: Duplicate entry', async () => {
    const genreIds: string[] = [];

    const genre = await seedGenre(serverParams);
    genreIds.push(genre.id);

    const genreToCreate = { name: genre.name };

    try {
      await assert.rejects(
        async () => {
          // In case the function does not throw, we want to clean the created entry
          const duplicateGenre = await serviceFunctions.createGenre(
            {
              authentication: serverParams.authentication,
              fileManager: serverParams.fileManager,
              database: serverParams.database,
              logger,
            },
            genreToCreate,
          );
          genreIds.push(duplicateGenre.id);
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
    } finally {
      await deleteGenres(serverParams, ...genreIds);
    }
  });
  await test('Invalid - Update validation: Without updates', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        params: {
          genre_id: randomUUID(),
        },
      },
    });

    const validateUpdateGenreSpy = context.mock.fn(
      validationFunctions.validateUpdateGenre,
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
  await test('Invalid - Update validation: Missing id', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        body: {
          name: randomString(GENRE.NAME.MIN_LENGTH.VALUE + 1),
        },
      },
    });

    const validateUpdateGenreSpy = context.mock.fn(
      validationFunctions.validateUpdateGenre,
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
  await test('Invalid - Update validation: Empty id', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        params: {
          genre_id: '',
        },
        body: {
          name: randomString(GENRE.NAME.MIN_LENGTH.VALUE + 1),
        },
      },
    });

    const validateUpdateGenreSpy = context.mock.fn(
      validationFunctions.validateUpdateGenre,
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
  await test('Invalid - Update validation: Invalid id', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        params: {
          genre_id: randomString(),
        },
        body: {
          name: randomString(GENRE.NAME.MIN_LENGTH.VALUE + 1),
        },
      },
    });

    const validateUpdateGenreSpy = context.mock.fn(
      validationFunctions.validateUpdateGenre,
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
  await test('Invalid - Update validation: Empty name', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        params: {
          genre_id: randomUUID(),
        },
        body: {
          name: '',
        },
      },
    });

    const validateUpdateGenreSpy = context.mock.fn(
      validationFunctions.validateUpdateGenre,
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
  await test('Invalid - Update validation: Name too short', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        params: {
          genre_id: randomUUID(),
        },
        body: {
          name: randomString(GENRE.NAME.MIN_LENGTH.VALUE - 1),
        },
      },
    });

    const validateUpdateGenreSpy = context.mock.fn(
      validationFunctions.validateUpdateGenre,
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
  await test('Invalid - Update validation: Name too long', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        params: {
          genre_id: randomUUID(),
        },
        body: {
          name: randomString(GENRE.NAME.MAX_LENGTH.VALUE + 1),
        },
      },
    });

    const validateUpdateGenreSpy = context.mock.fn(
      validationFunctions.validateUpdateGenre,
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
  await test('Invalid - Update service: Duplicate entry', async () => {
    const genreIds: string[] = [];
    const genres = await seedGenres(serverParams, 2);
    genreIds.push(
      ...genres.map(({ id }) => {
        return id;
      }),
    );

    const genreToUpdate = {
      genreId: genres[0]!.id,
      name: genres[1]!.name,
    };

    try {
      await assert.rejects(
        async () => {
          await serviceFunctions.updateGenre(
            {
              authentication: serverParams.authentication,
              fileManager: serverParams.fileManager,
              database: serverParams.database,
              logger,
            },
            genreToUpdate,
          );
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
    } finally {
      await deleteGenres(serverParams, ...genreIds);
    }
  });
  await test('Invalid - Delete validation: Missing id', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
    });

    const validateDeleteGenreSpy = context.mock.fn(
      validationFunctions.validateDeleteGenre,
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
  await test('Invalid - Delete validation: Empty id', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        params: {
          genre_id: '',
        },
      },
    });

    const validateDeleteGenreSpy = context.mock.fn(
      validationFunctions.validateDeleteGenre,
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
  await test('Invalid - Delete validation: Invalid id', (context) => {
    const { request } = createHttpMocks<ResponseWithContext>({
      logger,
      reqOptions: {
        params: {
          genre_id: randomString(),
        },
      },
    });

    const validateDeleteGenreSpy = context.mock.fn(
      validationFunctions.validateDeleteGenre,
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
