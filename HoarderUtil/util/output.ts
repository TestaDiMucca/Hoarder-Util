import * as colors from 'colors';

const OUT_TAG = 'h-util';

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

    console.log(colors.blue(`[${OUT_TAG}]`), ...args);
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
  public table(data: Array<Record<string, string>>) {
    console.table(data);
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

  public line(char?: string, length?: number) {
    const line = (char ?? '-').repeat(length ?? process.stdout.columns);
    console.log(colors.gray(line));
  }

  public newLine() {
    console.log('\n');
  }
}

export default new Output();
