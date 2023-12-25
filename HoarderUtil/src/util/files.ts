import * as path from 'path';

export const replaceExtension = (fileName: string, ext: string) =>
  path.join(
    path.dirname(fileName),
    path.basename(fileName, path.extname(fileName)) + '.' + ext
  );
