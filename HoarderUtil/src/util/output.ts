import * as colors from 'colors';
import { APP_NAME } from './constants';

const OUT_TAG = APP_NAME;

/**
 * Handles most the app stdout so we can append tags and
 *   colors and respect verbose settings
 */
class Output {
  private verbose: boolean;
  private errors: string[] = [];

  constructor() {
    this.verbose = false;
  }

  public setVerbose(verbose: boolean) {
    this.verbose = verbose;
  }

  /**
   * Always prints. Use for major messages
   */
  public out(...args: any[]) {
    console.log(colors.green(`[${OUT_TAG}]`), ...args);
  }

  /**
   * For verbose stuff and details and annoying things
   */
  public log(...args: any[]) {
    if (!this.verbose) return;

    console.log(colors.blue(`[${OUT_TAG}]`), ...args.map((a) => colors.dim(a)));
  }

  /**
   * Stylized as red to be error-tastique
   */
  public error(...args: any[]) {
    console.log(colors.red(`[${OUT_TAG}:error]`), ...args);
  }

  /**
   * Literally does nothing special
   * Exists just to remind console.table exists
   */
  private table(data: Array<Record<string, string>>) {
    console.table(
      data.map((d) => {
        const ret: Record<string, string> = {};
        Object.keys(d).forEach((k) => (ret[k] = overflow(d[k])));
        return ret;
      })
    );
  }

  /**
   * Unlike error() this queues for a dump later
   */
  public queueError(message: string) {
    this.errors.push(message);
  }

  public dump() {
    if (this.errors.length === 0) return;

    this.error('Exiting. Errors encountered:');
    this.errors.map((error, i) => {
      this.out(`‣ ${i + 1}:`, error);
    });
  }

  /**
   * Stateless printing helpers
   */
  public utils = {
    line: this.line,
    newLine: this.newLine,
    table: this.table,
  };

  private line(char?: string, length?: number) {
    const line = (char ?? '-').repeat(length ?? process.stdout.columns);
    console.log(colors.gray(line));
  }

  private newLine() {
    console.log('\n');
  }
}

const overflow = (str: string, max = 40) =>
  str.length > max ? str.slice(0, max - 1) + '…' : str;

export default new Output();
