import { chunkArray } from './helpers';

type Resolvable<R> = R | PromiseLike<R>;

/**
 * Stand-in for Bluebird.map
 * courtesy of Mr. Allister Craig Smith
 */
const map = async <T, R>(
  items: readonly T[],
  callback: (item: T, idx: number) => Resolvable<R>,
  options?: { concurrency?: number }
) => {
  const itemsWithIndex = items.map((v, i) => ({ v, i }));
  const batches = options?.concurrency
    ? chunkArray(itemsWithIndex, options.concurrency)
    : [itemsWithIndex];
  const results: R[] = [];

  for (const batch of batches) {
    results.push(
      ...(await Promise.all(batch.map(({ v, i }) => callback(v, i))))
    );
  }

  return results;
};

const reduce = async <T, R>(
  items: readonly T[],
  callback: (out: R, item: T) => Resolvable<R>,
  init: R
) => {
  let out = init;

  for (const item of items) {
    out = await callback(out, item);
  }

  return out;
};

const promises = {
  map,
  reduce,
};

export default promises;
