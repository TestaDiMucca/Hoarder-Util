import { Command, Argument } from 'commander';
import * as colors from 'colors/safe';

import { OperationHandler, Operations, TerminalArgs } from '../util/types';
import dateImg from './dateImg';
import { umu } from './global';
import nameToTag from './nameToTag';
import nihao from './nihao';
import output from '../util/output';
import { APP_NAME, APP_VER } from '../util/constants';
import dirTree from './dirTree';
import pathAliases, { PathAliasAction } from './pathAliases';
import { withAliasPersist } from './operations.helpers';
import opAlias, { OpAliasAction } from './opAlias';
import jpgCompress from './jpgCompress';

type AnyFnc = (...args: any[]) => any;

type ActionDefinition = {
  handler: OperationHandler;
  definition: Opt;
  options?: Opt[];
  args?: Argument[];
  helperText?: string;
};

type OptFlags = string;
type OptDescription = string;

type Opt = [OptFlags, OptDescription];

/** Common to all file operations */
const FILE_OP_OPTS: Opt[] = [
  ['-p, --path [path]', 'Specify custom path. Defaults to current dir.'],
  [
    '-e, --excludes <csv>',
    'dCSV (double comma) string of partial filenames to exclude. Applies to file operations.',
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
    definition: ['nihao [name]', 'Say nihao (Test method, totally useless)'],
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
  [Operations.directoryTree]: {
    handler: dirTree,
    options: [
      ['-p, --path [path]', 'Specify custom path. Defaults to current dir.'],
    ],
    definition: [
      'dir-tree <path>',
      'Create a directory tree from a CSV string definition.',
    ],
    helperText: `Example call:
      $ h-util dir-tree dir/subdir,dir/subdir2`,
  },
  [Operations.pathAlias]: {
    handler: pathAliases,
    definition: ['paths', 'Set path aliases for easy access later on.'],
    args: [
      new Argument('<action>', 'Which action to take').choices(
        Object.values(PathAliasAction)
      ),
      new Argument('[aliasName]', 'Name of the alias. Use with mk/rm.'),
      new Argument('[path]', 'The path to stash away. Used with mk.'),
    ],
  },
  [Operations.opAlias]: {
    handler: opAlias,
    definition: ['op-alias', 'See and manage saved operation runs'],
    args: [
      new Argument('<action>', 'Which action to take').choices(
        Object.values(OpAliasAction)
      ),
      new Argument('[aliasName]', 'Name of the alias. Use with run/rm.'),
    ],
  },
  [Operations.jpgCompress]: {
    handler: jpgCompress,
    definition: [
      'jpg-compress',
      'Compress unimportant images to a set quality for storage',
    ],
    args: [new Argument('<quality>', '1-100 quality setting')],
    options: [...FILE_OP_OPTS, ...UNIVERSAL_OPTS],
  },
};

const COMMON_OPTS: Array<[string, string]> = [
  [
    '-S, --saveAlias <alias>',
    'Save an alias after running to store the operation and its options',
  ],
  [
    '-c, --commit',
    'No dry runs, no prompts, just commit any changes because yolo.',
  ],
];

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
    const { args, options, definition, handler, helperText } =
      operationMap[opKey];
    /** Necessary to keep context of options to that command */
    const cmdChain = program.command(definition[0]).description(definition[1]);

    args?.forEach((arg) => cmdChain.addArgument(arg));
    [...(options ?? []), ...COMMON_OPTS].forEach((opt) =>
      cmdChain.option(opt[0], opt[1])
    );

    if (helperText) cmdChain.addHelpText('after', '\n' + helperText);

    cmdChain
      .action((...args) => {
        const opts = (args.find((a) => typeof a === 'object') ??
          {}) as TerminalArgs;

        const commandArgs: string[] = args.filter((a) => typeof a === 'string');

        if (opts?.verbose) output.setVerbose(opts?.verbose);

        output.out(`Running operation: ${colors.bold(opKey)}`);
        if (commandArgs.length)
          output.log(`Running with args: ${commandArgs.join(', ')}`);

        output.utils.newLine();

        const enhancedOpts = { ...opts, commandArgs, operation: opKey };

        withAliasPersist(async () => await handler(enhancedOpts), enhancedOpts);
      })
      .showHelpAfterError(true);
  });

  return program;
};
