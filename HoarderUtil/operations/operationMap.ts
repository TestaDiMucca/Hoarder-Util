import { Command } from 'commander';
import * as colors from 'colors/safe';

import { OperationHandler, Operations, TerminalArgs } from '../util/types';
import dateImg from './dateImg';
import { umu } from './global';
import nameToTag from './nameToTag';
import nihao from './nihao';
import output from '../util/output';
import { APP_NAME, APP_VER } from '../util/constants';

type AnyFnc = (...args: any[]) => any;

type ActionDefinition = {
  handler: OperationHandler;
  definition: Opt;
  options?: Opt[];
};

type OptFlags = string;
type OptDescription = string;

type Opt = [OptFlags, OptDescription];

/** Common to all file operations */
const FILE_OP_OPTS: Opt[] = [
  ['-p, --path [path]', 'Specify custom path. Defaults to current dir.'],
  [
    '-e, --excludes <csv>',
    'CSV string of partial filenames to exclude. Applies to file operations.',
  ],
  [
    '-c, --commit',
    'No dry runs, no prompts, just commit any changes because yolo.',
  ],
  ['-f, --format', 'Input template for matching or formatting'],
];

/** Apply to any action that actually does stuff */
const UNIVERSAL_OPTS: Opt[] = [
  ['-v, --verbose', 'Prints a lot of noisy logs, if you like that'],
];

type OpMap<T = AnyFnc> = {
  [key in Operations]?: T;
};

/**
 * Map option to handlers if available
 * If something requires more specific options and handling,
 *   then add it directly to index's main method
 */
export const operationMap: OpMap<ActionDefinition> = {
  [Operations.nihao]: {
    handler: nihao,
    definition: ['nihao', 'Say nihao (Test method, totally useless)'],
    options: [['-q, --quick', 'Suppress the file counter for whatever reason']],
  },
  [Operations.umu]: {
    handler: umu,
    definition: [
      'umu',
      'Offer praise to the passionate, beautiful and talented umu-chan',
    ],
  },
  [Operations.dateTag]: {
    handler: dateImg,
    options: [...FILE_OP_OPTS, ...UNIVERSAL_OPTS],
    definition: [
      'date-tag',
      "Adds date to supported file types' filenames for sorting purposes. Uses EXIF, and creation date if no EXIF.",
    ],
  },
  [Operations.nameToTag]: {
    handler: nameToTag,
    options: [...FILE_OP_OPTS, ...UNIVERSAL_OPTS],
    definition: ['name-to-tag', 'Parse media file names into tags'],
  },
};

export const setupProgram = (program: Command) =>
  program
    .name(APP_NAME)
    .version(APP_VER)
    .description(
      colors.magenta(
        '🧰 Data hoarder utils for convenience. Just a bunch of useless things I do at lot, packaged together.'
      )
    );

export const addCommandsAndOptions = (program: Command) => {
  Object.keys(operationMap).forEach((opKey: Operations) => {
    const { options, definition, handler } = operationMap[opKey];
    /** Necessary to keep context of options to that command */
    const cmdChain = program.command(definition[0]).description(definition[1]);

    options?.forEach((opt) => cmdChain.option(opt[0], opt[1]));

    cmdChain
      .action((...args) => {
        const opts = (args.find((a) => typeof a === 'object') ??
          {}) as TerminalArgs;

        if (opts?.verbose) output.setVerbose(opts?.verbose);

        output.out(`Running operation: ${colors.bold(opKey)}`);

        handler(opts);
      })
      .showHelpAfterError(true);
  });

  return program;
};
