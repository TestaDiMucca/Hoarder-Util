import { OP_ALIAS_STORE } from '../util/constants';
import output from '../util/output';
import ConfigStore from '../util/confLoader';
import { BasicFlags, TerminalArgs } from '../util/types';
import { confAliasLsFactory, confAliasRmFactory } from './operations.helpers';
import { msgShortcuts } from '../util/helpers';
import { operationMap } from './operationMap';

export enum OpAliasAction {
  ls = 'ls',
  run = 'run',
  rm = 'rm',
}

const opAlias = async (opts: BasicFlags) => {
  const [operation, alias] = opts.commandArgs;

  output.log(`Aliases called with method "${operation}", args ${alias}`);

  switch (operation) {
    case OpAliasAction.ls:
      return opsLs();
    case OpAliasAction.rm:
      return opsRm(alias);
    case OpAliasAction.run:
      return opsRun(alias);
    default:
      output.error(`Unsupported action "${operation}"`);
  }
};

const opsRun = async (alias: string) => {
  const stored = ConfigStore.get(OP_ALIAS_STORE);
  const op: TerminalArgs = stored[alias];

  if (!op) {
    opsLs();
    return msgShortcuts.errorAndQuit(
      `Stored op ${alias} could not be found. See list above for what's available.`
    );
  }

  output.out(`Preparing to run - ${optsToStr(op)}`);

  const handler = operationMap[op.operation]?.handler;

  if (!handler)
    msgShortcuts.errorAndQuit(
      `Handler for ${op.operation} could not be found.`
    );

  await handler(op);

  output.out(`Completed run - ${op.operation}`);
};

const optsToStr = (v: TerminalArgs) => {
  {
    const { operation, ...opts } = v;

    return `${operation} : ${Object.entries(opts)
      .map(([k, v]) => `${k}=${v}`)
      .join(' ')}`;
  }
};

const opsLs = confAliasLsFactory<TerminalArgs>(OP_ALIAS_STORE, optsToStr);

const opsRm = confAliasRmFactory(OP_ALIAS_STORE, opsLs);

export default opAlias;
