/**
 * @file Globally available operations
 */

import * as figlet from 'figlet';
import * as colors from 'colors/safe';
import umuAscii from './umuAscii';
import output from '../util/output';
import { getSplashText } from '../fun/splash';
import { ColorsWithTheme } from '../util/types';

export const header = () => {
  console.log(
    colors.cyan(figlet.textSync('H-util-cli', { horizontalLayout: 'full' }))
  );
  const { len, render } = getSplashText();
  output.line('=', len);
  render();
  output.line('=', len);
  output.newLine();
};

colors.setTheme({
  roma: ['bgRed', 'yellow'],
});

export const umu = () => {
  console.log((colors as ColorsWithTheme<'roma'>).roma(umuAscii));

  console.log(colors.yellow(figlet.textSync('Umu umu')));
};
