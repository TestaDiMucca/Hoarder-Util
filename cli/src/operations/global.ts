/**
 * @file Globally available operations
 */

import * as figlet from 'figlet';
import umuAscii from '../fun/umuAscii';
import output from '../util/output';
import { getSplashText } from '../fun/splash';
import { randomFromArray } from '../util/helpers';
import colors from '../util/colors';

export const header = () => {
  console.log(
    colors.cyan(figlet.textSync('H-util-cli', { horizontalLayout: 'full' }))
  );
  const { len, render } = getSplashText();
  output.utils.line('=', len);
  render();
  output.utils.line('=', len);
  output.utils.newLine();
};

export const umu = () => {
  console.log(colors.roma(randomFromArray(umuAscii)));

  console.log(colors.yellow(figlet.textSync('Umu umu')));
};
