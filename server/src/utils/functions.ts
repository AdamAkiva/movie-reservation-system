const ALPHA_NUMERIC = {
  CHARACTERS:
    'ABCDEABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  LENGTH: 67,
} as const;

/**********************************************************************************/

function strcasecmp<T extends string>(s1: T, s2: T) {
  return s1.localeCompare(s2, undefined, {
    sensitivity: 'accent',
  });
}

function randomAlphaNumericString(len = 32) {
  let str = '';
  for (let i = 0; i < len; ++i) {
    str += ALPHA_NUMERIC.CHARACTERS.charAt(
      Math.floor(Math.random() * ALPHA_NUMERIC.LENGTH),
    );
  }

  return str;
}

function encodeCursor(id: string, createdAt: Date) {
  return Buffer.from(`${id},${createdAt.toISOString()}`).toString('base64');
}

function decodeCursor(cursor: string) {
  const decodedCursor = Buffer.from(cursor, 'base64')
    .toString('utf-8')
    .split(',');

  return {
    id: decodedCursor[0]!,
    createdAt: new Date(decodedCursor[1]!),
  } as const;
}

/**********************************************************************************/

export { decodeCursor, encodeCursor, randomAlphaNumericString, strcasecmp };
