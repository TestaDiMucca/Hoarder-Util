import Conf from 'conf';

const config = new Conf();

const ConfigStore = {
  get: config.get,
  set: config.set,
  has: config.has,
};

export default ConfigStore;
