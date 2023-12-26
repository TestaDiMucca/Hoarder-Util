import * as CliProgress from 'cli-progress';
import * as colors from 'colors/safe';

import output from '../util/output';

type NewBarArgs = Record<string, number>;
type BarMap<T extends NewBarArgs> = Record<keyof T, CliProgress.SingleBar>;

export default class ProgressBar<T extends NewBarArgs> {
  private bar: CliProgress.MultiBar;
  private bars: BarMap<T>;
  private stopped = false;

  constructor(barName: string, args: T) {
    this.bar = new CliProgress.MultiBar(
      {
        clearOnComplete: false,
        hideCursor: true,
        format: `${barName}: ${colors.cyan(
          '{bar}'
        )} | {stepName} | {value}/{total} {percentage}%`,
      },
      CliProgress.Presets.shades_classic
    );

    if (output.isVerbose()) {
      this.bar.stop();
      return;
    }

    this.bars = Object.keys(args).reduce<BarMap<T>>((a, barName) => {
      a[barName as keyof T] = this.bar.create(args[barName], 0);

      return a;
    }, {} as BarMap<T>);
  }

  public updateBar = (bar: keyof T, progress: number, stepName?: string) => {
    if (this.stopped) return;

    this.bars[bar].update(progress, { stepName });
  };

  public stop = () => {
    this.bar.stop();
    this.stopped = true;
  };
}
