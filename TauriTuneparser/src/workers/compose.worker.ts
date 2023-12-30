import { Graphs, MediaRecord } from 'src/types/types';
import { Composer_InboundMessage } from './workers.types';
import { handleError, handleMessage } from './workers.helpers';
import { VideoIncludeSettings } from 'src/utils/configs';
import { sortByKey } from 'src/utils/helpers';

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

type CounterMap = Record<string, number>;

const increment = (record: CounterMap, key: string) =>
  record[key] ? record[key]++ : (record[key] = 1);

const transformToArray = (record: CounterMap) =>
  Object.entries(record).map(([name, value]) => ({ name, value }));

const getGenrePie = (
  data: MediaRecord[],
  opts: Composer_InboundMessage['options']
) => {
  const { videoSettings, classifications } = opts;

  const parsedClassifications = classifications
    .split(',')
    .filter((s) => s.length > 1);

  const allGenres: CounterMap = {};
  const genreClass: CounterMap = {};

  let total = 0;

  data.forEach((media, i) => {
    const { hasVideo, genre } = media;

    if (
      (hasVideo && videoSettings === VideoIncludeSettings.exclude) ||
      (!hasVideo && videoSettings === VideoIncludeSettings.only)
    )
      return;

    total++;

    const genreLabel = genre ?? 'Unknown genre';

    if (parsedClassifications.length === 0) {
      increment(allGenres, genreLabel);
    }

    const belongsToClass = parsedClassifications.find((c) =>
      genre?.toLowerCase().includes(c.toLowerCase())
    );

    const classLabel = belongsToClass ?? 'Other';
    increment(allGenres, `${classLabel}: ` + genreLabel);
    increment(genreClass, classLabel);
  });

  const genreClassArr = sortByKey(transformToArray(genreClass), 'name');

  return {
    allGenres: sortByKey(transformToArray(allGenres), 'name'),
    genreClass: genreClassArr,
  };
};
