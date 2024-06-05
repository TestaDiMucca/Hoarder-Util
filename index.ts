#!/usr/bin/env node
import { Command } from 'commander';

import { header } from './src/operations/global';
import { addCommandsAndOptions, setupProgram } from './src/operationMap';

const program = new Command();

header();

setupProgram(program);
addCommandsAndOptions(program).showHelpAfterError().parse(process.argv);
