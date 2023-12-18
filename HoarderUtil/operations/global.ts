/**
 * @file Globally available operations
 */

import * as figlet from 'figlet';
import * as colors from 'colors/safe';

export const header = () => {
  console.log(
    colors.cyan(figlet.textSync('H-util-cli', { horizontalLayout: 'full' }))
  );
};
