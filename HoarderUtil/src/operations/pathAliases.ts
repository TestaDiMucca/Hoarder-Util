import ConfigStore from '../util/confLoader';
import { PATH_ALIAS_STORE } from '../util/constants';
import {
  checkPathExists,
  getUserConfirmation,
  msgShortcuts,
} from '../util/helpers';
import output from '../util/output';
import { BasicFlags } from '../util/types';

export enum PathAliasAction {
  ls = 'ls',
  mk = 'mk',
  rm = 'rm',
}

const pathAliases = async (opts: BasicFlags) => {
  const [operation, alias, path] = opts.commandArgs;

  output.log(
    `Aliases called with method "${operation}", args ${alias}:${path}`
  );

  switch (operation) {
    case PathAliasAction.ls:
      return pathsLs();
    case PathAliasAction.mk:
      return pathsMk(alias, path);
    case PathAliasAction.rm:
      return pathsRm(alias);
    default:
      output.error(`Unsupported action "${operation}"`);
  }
};

const pathsLs = () => {
  const stored = ConfigStore.get(PATH_ALIAS_STORE);

  if (!stored) return output.out('There are no stored path aliases.');

  if (typeof stored !== 'object')
    msgShortcuts.errorAndQuit(
      `Something weird is stored in the store: ${stored}`
    );

  output.utils.table(
    Object.keys(stored).map((k) => ({
      alias: k,
      path: stored[k],
    }))
  );
};

const pathsMk = async (alias: string, path: string) => {
  const exists = await checkPathExists(path);

  if (!exists) {
    output.error('Path does not appear valid.');

    const input = getUserConfirmation('Store anyway?');

    if (input === 'n') return;
  }

  const curr = (ConfigStore.get(PATH_ALIAS_STORE) ?? {}) as Record<
    string,
    string
  >;

  ConfigStore.set(PATH_ALIAS_STORE, {
    ...curr,
    [alias]: path,
  });

  output.out(`Added path under alias "${alias}"`);
  pathsLs();
};

const pathsRm = (alias: string) => {
  const key = `${PATH_ALIAS_STORE}.${alias}`;
  const exists = ConfigStore.get(key);

  if (!exists) msgShortcuts.errorAndQuit(`Alias ${alias} does not exist.`);

  ConfigStore.delete(key);

  output.out('Store now:');
  pathsLs();
};

export default pathAliases;
