import { PATH_ALIAS_STORE } from '../util/constants';
import { checkPathExists } from '../util/files';
import { getUserConfirmation } from '../util/helpers';
import output from '../util/output';
import { BasicFlags } from '../util/types';
import {
  confAliasLsFactory,
  confAliasMkFactory,
  confAliasRmFactory,
} from './operations.helpers';

export enum PathAliasAction {
  ls = 'ls',
  mk = 'mk',
  rm = 'rm',
}

const pathAliases = async (opts: BasicFlags) => {
  const [operation, alias, path] = opts.commandArgs;

  output.log(
    `Path aliases called with method "${operation}", args ${alias}:${path}`
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

const pathsLs = confAliasLsFactory(PATH_ALIAS_STORE);

const pathsMk = confAliasMkFactory<string>(
  PATH_ALIAS_STORE,
  pathsLs,
  async (path) => {
    const exists = await checkPathExists(path);

    if (!exists) {
      output.error('Path does not appear valid.');

      const input = getUserConfirmation('Store anyway?');

      if (input === 'n') return false;
    }

    return true;
  }
);

const pathsRm = confAliasRmFactory(PATH_ALIAS_STORE, pathsLs);

export default pathAliases;
