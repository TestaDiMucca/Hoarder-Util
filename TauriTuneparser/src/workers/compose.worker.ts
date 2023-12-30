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
      case Graphs.genrePlays:
        handleMessage(getGenrePie(data, options, true));
        return;
      default:
        return handleError('Unsupported graph type');
    }
  }
);

type CounterMap = Record<string, number>;

const increment = (record: CounterMap, key: string, amount = 1) =>
  record[key] ? (record[key] += amount) : (record[key] = amount);

/** Convert to pie graph's required data format */
const transformToArray = (record: CounterMap) =>
  Object.entries(record).map(([name, value]) => ({ name, value }));

const getGenrePie = (
  data: MediaRecord[],
  opts: Composer_InboundMessage['options'],
  byPlays = false
) => {
  const { videoSettings, classifications } = opts;

  const parsedClassifications = classifications
    .split(',')
    .filter((s) => s.length > 1);

  const allGenres: CounterMap = {};
  const genreClass: CounterMap = {};

  let total = 0;

  data.forEach((media) => {
    const { hasVideo, genre, plays } = media;

    if (
      (hasVideo && videoSettings === VideoIncludeSettings.exclude) ||
      (!hasVideo && videoSettings === VideoIncludeSettings.only)
    )
      return;

    if (byPlays && (!plays || plays === 0)) return;

    const genreLabel = genre ?? 'Unknown genre';

    if (parsedClassifications.length === 0) {
      increment(allGenres, genreLabel);
    }

    const belongsToClass = parsedClassifications.find((c) =>
      genre?.toLowerCase().includes(c.toLowerCase())
    );

    const incrementAmount = byPlays ? plays : 1;

    const classLabel = belongsToClass ?? 'Other';
    increment(allGenres, `${classLabel}: ` + genreLabel, incrementAmount);
    increment(genreClass, classLabel, incrementAmount);

    total += incrementAmount;
  });

  const genreClassArr = sortByKey(transformToArray(genreClass), 'name');

  return {
    allGenres: sortByKey(transformToArray(allGenres), 'name'),
    genreClass: genreClassArr,
  };
};
