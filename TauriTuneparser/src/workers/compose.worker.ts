import { Graphs, MediaRecord } from 'src/types/types';
import { Composer_InboundMessage } from './workers.types';
import { handleError, handleMessage } from './workers.helpers';
import { VideoIncludeSettings } from 'src/utils/configs';

addEventListener(
  'message',
  (message: MessageEvent<Composer_InboundMessage>) => {
    const { graph, data, options } = message.data;

    switch (graph) {
      case Graphs.genrePie:
        handleMessage(getGenrePie(data, options));
        return;

      default:
        return handleError('Unsupported graph type');
    }
  }
);

const increment = (record: Record<string, number>, key: string) =>
  record[key] ? record[key]++ : (record[key] = 1);

const transformToArray = (record: Record<string, number>) =>
  Object.entries(record).map(([name, value]) => ({ name, value }));

const getGenrePie = (
  data: MediaRecord[],
  opts: Composer_InboundMessage['options']
) => {
  const { videoSettings, classifications } = opts;

  const parsedClassifications = classifications
    .split(',')
    .filter((s) => s.length > 1);

  const allGenres: Record<string, number> = {};
  const genreClass: Record<string, number> = {};

  let total = 0;

  data.forEach((media, i) => {
    const { hasVideo, genre } = media;

    if (
      (hasVideo && videoSettings === VideoIncludeSettings.exclude) ||
      (!hasVideo && videoSettings === VideoIncludeSettings.only)
    )
      return;

    total++;
    increment(allGenres, genre ?? 'Unknown genre');

    if (parsedClassifications.length === 0) return;

    const belongsToClass = parsedClassifications.find((c) =>
      genre?.toLowerCase().includes(c.toLowerCase())
    );

    increment(genreClass, belongsToClass ?? 'Other');
  });

  return {
    allGenres: transformToArray(allGenres),
    genreClass: transformToArray(genreClass),
  };
};
