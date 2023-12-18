import * as colors from 'colors';

import output from '../util/output';
import { Operations, TerminalArgs } from '../util/types';

const DESCRIPTIONS: Record<Operations, string> = {
  [Operations.dateTag]:
    "Adds date to supported file types' filenames for sorting purposes. Uses EXIF, and creation date if no EXIF.",
  [Operations.describe]: 'You are looking at it now.',
  [Operations.nihao]: 'Test method to confirm build works.',
  [Operations.umu]:
    'Offer praise to the passionate, beautiful and talented umu-chan',
};

const describeHUtils = (_opts: TerminalArgs) =>
  Object.keys(DESCRIPTIONS).forEach((o) => {
    output.out('‣', colors.bold(o), '-', DESCRIPTIONS[o]);
  });

export default describeHUtils;
