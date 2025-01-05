import { type Request, HTTP_STATUS_CODES, Zod } from '../../utils/index.js';

import {
  coerceNumber,
  parseValidationResult,
  VALIDATION,
} from '../utils.validator.js';

/**********************************************************************************/

const { HALL, PARAMS, BODY } = VALIDATION;

/**********************************************************************************/

const createHallSchema = Zod.object(
  {
    id: Zod.string({
      invalid_type_error: HALL.ID.INVALID_TYPE_ERROR_MESSAGE,
    })
      .uuid(HALL.ID.ERROR_MESSAGE)
      .optional(),
    name: Zod.string({
      invalid_type_error: HALL.NAME.INVALID_TYPE_ERROR_MESSAGE,
      required_error: HALL.NAME.REQUIRED_ERROR_MESSAGE,
    })
      .min(HALL.NAME.MIN_LENGTH.VALUE, HALL.NAME.MIN_LENGTH.ERROR_MESSAGE)
      .max(HALL.NAME.MAX_LENGTH.VALUE, HALL.NAME.MAX_LENGTH.ERROR_MESSAGE)
      .toLowerCase(),
    rows: Zod.preprocess(
      coerceNumber(
        HALL.ROWS.INVALID_TYPE_ERROR_MESSAGE,
        HALL.ROWS.REQUIRED_ERROR_MESSAGE,
      ),
      Zod.number()
        .min(HALL.ROWS.MIN_LENGTH.VALUE, HALL.ROWS.MIN_LENGTH.ERROR_MESSAGE)
        .max(HALL.ROWS.MAX_LENGTH.VALUE, HALL.ROWS.MAX_LENGTH.ERROR_MESSAGE),
    ),
    columns: Zod.preprocess(
      coerceNumber(
        HALL.COLUMNS.INVALID_TYPE_ERROR_MESSAGE,
        HALL.COLUMNS.REQUIRED_ERROR_MESSAGE,
      ),
      Zod.number()
        .min(
          HALL.COLUMNS.MIN_LENGTH.VALUE,
          HALL.COLUMNS.MIN_LENGTH.ERROR_MESSAGE,
        )
        .max(
          HALL.COLUMNS.MAX_LENGTH.VALUE,
          HALL.COLUMNS.MAX_LENGTH.ERROR_MESSAGE,
        ),
    ),
  },
  {
    invalid_type_error: BODY.INVALID_TYPE_ERROR_MESSAGE,
    required_error: BODY.REQUIRED_ERROR_MESSAGE,
  },
);

const updateHallBodySchema = Zod.object(
  {
    name: Zod.string({
      invalid_type_error: HALL.NAME.INVALID_TYPE_ERROR_MESSAGE,
      required_error: HALL.NAME.REQUIRED_ERROR_MESSAGE,
    })
      .min(HALL.NAME.MIN_LENGTH.VALUE, HALL.NAME.MIN_LENGTH.ERROR_MESSAGE)
      .max(HALL.NAME.MAX_LENGTH.VALUE, HALL.NAME.MAX_LENGTH.ERROR_MESSAGE)
      .toLowerCase()
      .optional(),
    rows: Zod.preprocess(
      coerceNumber(HALL.ROWS.INVALID_TYPE_ERROR_MESSAGE),
      Zod.number()
        .min(HALL.ROWS.MIN_LENGTH.VALUE, HALL.ROWS.MIN_LENGTH.ERROR_MESSAGE)
        .max(HALL.ROWS.MAX_LENGTH.VALUE, HALL.ROWS.MAX_LENGTH.ERROR_MESSAGE),
    ).optional(),
    columns: Zod.preprocess(
      coerceNumber(HALL.COLUMNS.INVALID_TYPE_ERROR_MESSAGE),
      Zod.number()
        .min(
          HALL.COLUMNS.MIN_LENGTH.VALUE,
          HALL.COLUMNS.MIN_LENGTH.ERROR_MESSAGE,
        )
        .max(
          HALL.COLUMNS.MAX_LENGTH.VALUE,
          HALL.COLUMNS.MAX_LENGTH.ERROR_MESSAGE,
        ),
    ).optional(),
  },
  {
    invalid_type_error: BODY.INVALID_TYPE_ERROR_MESSAGE,
    required_error: BODY.REQUIRED_ERROR_MESSAGE,
  },
).superRefine((hallUpdates, context) => {
  if (!Object.keys(hallUpdates).length) {
    context.addIssue({
      code: Zod.ZodIssueCode.custom,
      message: HALL.NO_FIELDS_TO_UPDATE_ERROR_MESSAGE,
      fatal: true,
    });
  }
});

const updateHallParamsSchema = Zod.object(
  {
    hall_id: Zod.string({
      invalid_type_error: HALL.ID.INVALID_TYPE_ERROR_MESSAGE,
      required_error: HALL.ID.REQUIRED_ERROR_MESSAGE,
    }).uuid(HALL.ID.ERROR_MESSAGE),
  },
  {
    invalid_type_error: PARAMS.INVALID_TYPE_ERROR_MESSAGE,
    required_error: PARAMS.REQUIRED_ERROR_MESSAGE,
  },
);

const deleteHallSchema = Zod.object(
  {
    hall_id: Zod.string({
      invalid_type_error: HALL.ID.INVALID_TYPE_ERROR_MESSAGE,
      required_error: HALL.ID.REQUIRED_ERROR_MESSAGE,
    }).uuid(HALL.ID.ERROR_MESSAGE),
  },
  {
    invalid_type_error: PARAMS.INVALID_TYPE_ERROR_MESSAGE,
    required_error: PARAMS.REQUIRED_ERROR_MESSAGE,
  },
);

/**********************************************************************************/

function validateCreateHall(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { body } = req;

  const validatedResult = createHallSchema.safeParse(body);
  const parsedValidatedResult = parseValidationResult(
    validatedResult,
    HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
  );

  return parsedValidatedResult;
}

function validateUpdateHall(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { body, params } = req;

  const validatedBodyResult = updateHallBodySchema.safeParse(body);
  const parsedValidatedResult = parseValidationResult(
    validatedBodyResult,
    HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
  );

  const validatedParamsResult = updateHallParamsSchema.safeParse(params);
  const { hall_id: hallId } = parseValidationResult(
    validatedParamsResult,
    HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
  );

  return {
    hallId,
    ...parsedValidatedResult,
  } as const;
}

function validateDeleteHall(req: Request) {
  const { params } = req;

  const validatedResult = deleteHallSchema.safeParse(params);
  const { hall_id: hallId } = parseValidationResult(
    validatedResult,
    HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY,
  );

  return hallId;
}

/**********************************************************************************/

export { validateCreateHall, validateDeleteHall, validateUpdateHall };
