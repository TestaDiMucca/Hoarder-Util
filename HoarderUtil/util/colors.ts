import * as colors from 'colors/safe';
import { ColorsWithTheme } from './types';

colors.setTheme({
  roma: ['bgRed', 'yellow'],
});

/**
 * Colors wrapped with custom themes
 */
export default colors as ColorsWithTheme<'roma'>;
