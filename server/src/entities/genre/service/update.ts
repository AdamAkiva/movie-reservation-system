import { eq } from 'drizzle-orm';

import {
  GeneralError,
  HTTP_STATUS_CODES,
  type RequestContext,
} from '../../../utils/index.ts';

import {
  type Genre,
  type UpdateGenreValidatedData,
  handlePossibleDuplicationError,
} from './utils.ts';

/**********************************************************************************/

async function updateGenre(
  context: RequestContext,
  genreToUpdate: UpdateGenreValidatedData,
): Promise<Genre> {
  const { database } = context;
  const handler = database.getHandler();
  const { genre: genreModel } = database.getModels();
  const { genreId, ...fieldsToUpdate } = genreToUpdate;

  try {
    const [updatedGenre] = await handler
      .update(genreModel)
      .set({ ...fieldsToUpdate, updatedAt: new Date() })
      .where(eq(genreModel.id, genreId))
      .returning({ id: genreModel.id, name: genreModel.name });
    if (!updatedGenre) {
      throw new GeneralError(
        HTTP_STATUS_CODES.NOT_FOUND,
        `Genre '${genreId}' does not exist`,
      );
    }

    return updatedGenre;
  } catch (err) {
    // If there is a conflict it is due to the name update, hence, the name
    // field must exist
    throw handlePossibleDuplicationError(err, fieldsToUpdate.name!);
  }
}

/*********************************************************************************/

export { updateGenre };
