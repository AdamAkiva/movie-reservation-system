import { eq } from 'drizzle-orm';

import {
  type DatabaseHandler,
  type DatabaseModel,
  HTTP_STATUS_CODES,
  MRSError,
  type RequestContext,
} from '../../../utils/index.js';

import {
  handlePossibleMissingGenreError,
  type Movie,
  type UpdateMovieValidatedData,
} from './utils.js';

/**********************************************************************************/

async function updateMovie(
  context: RequestContext,
  movieToUpdate: UpdateMovieValidatedData,
): Promise<Movie> {
  const updatedMovie = await updateMovieAndPoster(context, movieToUpdate);

  return updatedMovie;
}

/**********************************************************************************/

// Track this issue for more optimized solution: https://github.com/drizzle-team/drizzle-orm/issues/2078
async function updateMovieAndPoster(
  context: RequestContext,
  movieToUpdate: UpdateMovieValidatedData,
) {
  const { database, fileManager, logger } = context;
  const handler = database.getHandler();
  const {
    movie: movieModel,
    moviePoster: moviePosterModel,
    genre: genreModel,
  } = database.getModels();
  const { movieId, poster, ...fieldsToUpdate } = movieToUpdate;
  const now = new Date();

  return await handler.transaction(async (transaction) => {
    await Promise.all([
      updateMoviePoster({
        transaction,
        moviePosterModel,
        fileManager,
        logger,
        movieId,
        poster,
        updatedAt: now,
      }),
      updateMovieInDatabase({
        transaction,
        movieModel,
        movieId,
        fieldsToUpdate,
        updatedAt: now,
      }),
    ]);

    // The entry must exist since we are in the same transaction.
    // If for some reason it is not, check the transaction isolation level
    const updatedMovie = (
      await transaction
        .select({
          id: movieModel.id,
          title: movieModel.title,
          description: movieModel.description,
          price: movieModel.price,
          genre: genreModel.name,
        })
        .from(movieModel)
        .where(eq(movieModel.id, movieId))
        .innerJoin(genreModel, eq(genreModel.id, movieModel.genreId))
    )[0]!;

    return updatedMovie;
  });
}

async function updateMoviePoster(params: {
  transaction: DatabaseHandler;
  moviePosterModel: DatabaseModel<'moviePoster'>;
  fileManager: RequestContext['fileManager'];
  logger: RequestContext['logger'];
  movieId: string;
  poster: UpdateMovieValidatedData['poster'];
  updatedAt: Date;
}) {
  const {
    transaction,
    moviePosterModel,
    fileManager,
    logger,
    movieId,
    poster,
    updatedAt,
  } = params;

  if (!poster) {
    return;
  }

  const moviePoster = await transaction
    .select({ absolutePath: moviePosterModel.absolutePath })
    .from(moviePosterModel)
    .where(eq(moviePosterModel.movieId, movieId));
  if (!moviePoster.length) {
    throw new MRSError(
      HTTP_STATUS_CODES.NOT_FOUND,
      `Movie '${movieId}' does not exist`,
    );
  }

  await transaction
    .update(moviePosterModel)
    .set({
      absolutePath: poster.absolutePath,
      sizeInBytes: poster.sizeInBytes,
      updatedAt,
    })
    .where(eq(moviePosterModel.movieId, movieId));

  fileManager.deleteFile(moviePoster[0]!.absolutePath).catch((err: unknown) => {
    logger.warn(
      `Failure to delete old file: ${moviePoster[0]!.absolutePath}`,
      err,
    );
  });
}

async function updateMovieInDatabase(params: {
  transaction: DatabaseHandler;
  movieModel: DatabaseModel<'movie'>;
  movieId: string;
  fieldsToUpdate: Omit<UpdateMovieValidatedData, 'movieId' | 'poster'>;
  updatedAt: Date;
}) {
  const { transaction, movieModel, movieId, fieldsToUpdate, updatedAt } =
    params;

  if (!Object.keys(fieldsToUpdate).length) {
    return;
  }

  try {
    const updatedMovie = await transaction
      .update(movieModel)
      .set({ ...fieldsToUpdate, updatedAt })
      .where(eq(movieModel.id, movieId))
      .returning({
        id: movieModel.id,
      });
    if (!updatedMovie.length) {
      throw new MRSError(
        HTTP_STATUS_CODES.NOT_FOUND,
        `Movie '${movieId}' does not exist`,
      );
    }
  } catch (err) {
    throw handlePossibleMissingGenreError(err, fieldsToUpdate.genreId!);
  }
}

/**********************************************************************************/

export { updateMovie };
