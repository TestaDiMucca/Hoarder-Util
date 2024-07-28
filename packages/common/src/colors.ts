const colors = require('colors/safe');

/** A custom theme was applied */
type ColorsWithTheme<T extends string> = typeof colors & {
    [key in T]: (i: string) => void;
};

type ColorOpts = keyof typeof colors;

const customThemes: Record<string, ColorOpts[]> = { roma: ['bgRed', 'yellow'] };

colors.setTheme(customThemes);

/**
 * Colors wrapped with custom themes
 */
export default colors as ColorsWithTheme<keyof typeof customThemes>;
