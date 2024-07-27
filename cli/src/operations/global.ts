/**
 * @file Globally available operations
 */

import * as figlet from 'figlet';
import { utils } from '@common/fileops';

import umuAscii from '../fun/umuAscii';
import output from '../util/output';
import { getSplashText } from '../fun/splash';
import colors from '../util/colors';

export const header = () => {
    console.log(colors.cyan(figlet.textSync('H-util-cli', { horizontalLayout: 'full' })));
    const { len, render } = getSplashText();
    output.utils.line('=', len);
    render();
    output.utils.line('=', len);
    output.utils.newLine();
};

export const umu = () => {
    console.log(colors.roma(utils.randomFromArray(umuAscii)));

    console.log(colors.yellow(figlet.textSync('Umu umu')));
};
