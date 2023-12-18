#!/usr/bin/env node
import { Command, Option } from 'commander';

import { header } from './operations/global';
import { Operations, TerminalArgs } from './util/types';
import nihao from './operations/nihao';

const program = new Command();

program
  .description('Data hoarder utils for convenience')
  .addOption(
    new Option('-o, --operation [type]', 'Specify operation to run').choices(
      Object.values(Operations)
    )
  )
  .option('-p, --path [path]', 'Specify custom path. Defaults to current dir.')
  .parse(process.argv);

const options = program.opts() as TerminalArgs;

header();

const main = () => {
  const { operation } = options;

  switch (operation) {
    case Operations.nihao:
      nihao();
      break;
    default:
      console.log('Oops, forgot to implement. Coming soon maybe.');
  }
};

if (Object.values(options).length === 0) program.help();
else main();
