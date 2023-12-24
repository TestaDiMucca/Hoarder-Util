import * as colors from 'colors/safe';

/** A custom theme was applied */
type ColorsWithTheme<T extends string> = typeof colors & {
  [key in T]: (i: string) => void;
};

colors.setTheme({
  roma: ['bgRed', 'yellow'],
});

/**
 * Colors wrapped with custom themes
 */
export default colors as ColorsWithTheme<'roma'>;
