/**
 * @file Globally available operations
 */

import * as figlet from 'figlet';
import * as colors from 'colors/safe';
import { umuAscii } from './umuAscii';

export const header = () => {
  console.log(
    colors.cyan(figlet.textSync('H-util-cli', { horizontalLayout: 'full' }))
  );
};

colors.setTheme({
  roma: ['bgRed', 'yellow'],
});

export const umu = () => {
  console.log((colors as any).roma(umuAscii));

  console.log(colors.yellow(figlet.textSync('Umu umu')));
};
