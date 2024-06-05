import Conf from 'conf';

const config = new Conf();

export default config;

export const addKeyToStore = <T>(storeName: string, key: string, val: T) => {
  const curr = (config.get(storeName) ?? {}) as Record<string, T>;

  config.set(storeName, {
    ...curr,
    [key]: val,
  });
};
