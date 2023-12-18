import * as ffMeta from 'ffmetadata';
import output from './output';

type ReadTags = {
  artist?: string;
  title?: string;
  /** Often just year */
  date?: string;
  genre?: string;
  comment?: string;
};

export const readTags = (filePath: string): Promise<null | ReadTags> =>
  new Promise((resolve) => {
    ffMeta.read(filePath, (err, data: ReadTags) => {
      if (err) {
        output.queueError(err.message);
        return resolve(null);
      }
      resolve(data);
    });
  });

export const writeTags = (
  filePath: string,
  tags: Partial<ReadTags>
): Promise<void> =>
  new Promise((resolve) => {
    ffMeta.write(filePath, tags, (err) => {
      if (err) output.queueError(err.message);

      resolve();
    });
  });
