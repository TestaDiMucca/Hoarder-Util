#!/usr/bin/env node
import { Command, Option } from 'commander';
import * as colors from 'colors/safe';

import { header, umu } from './operations/global';
import { Operations, TerminalArgs } from './util/types';
import { operationMap } from './operations/operationMap';
import output from './util/output';
import { messageAndQuit } from './util/helpers';

const program = new Command();

program
  .name('h-util')
  .version('0.0.1')
  .description(
    'Data hoarder utils for convenience. Use -o describe for descriptions.'
  )
  .addOption(
    new Option('-o, --operation <type>', 'Specify operation to run').choices(
      Object.values(Operations)
    )
  )
  .option('-p, --path [path]', 'Specify custom path. Defaults to current dir.')
  .option('-v, --verbose', 'Prints a lot of noisy logs, if you like that')
  .option(
    '-c, --commit',
    'No dry runs, no prompts, just commit any changes because yolo.'
  )
  .option(
    '-f, --format <format>',
    'Used to defined the pattern for tagging/renaming options.'
  )
  .option(
    '-e, --excludes <csv>',
    'CSV string of partial filenames to exclude. Applies to file operations.'
  )
  .showHelpAfterError()
  .parse(process.argv);

const options = program.opts<TerminalArgs>();

header();

const main = () => {
  const { operation, verbose } = options;

  if (verbose) output.setVerbose(true);

  output.out(`Running operation: ${colors.bold(operation)}`);

  switch (operation) {
    default:
      {
        const opHandler = operationMap[operation];
        if (opHandler) return opHandler(options);
      }

      output.error('Oops, forgot to implement. Coming soon maybe.');
  }

  messageAndQuit('🫡 再見');
};

/**
 * Require an option to run, otherwise wtf are we doing
 */
if (Object.values(options).length === 0) {
  umu();
  program.help();
} else main();
