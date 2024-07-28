import colors from './colors';

/**
 * Handles most the app stdout so we can append tags and
 *   colors and respect verbose settings
 */
export class Output {
    private verbose: boolean;
    private errors: string[] = [];
    private tag: string;

    constructor(tag: string, verbose = false) {
        this.tag = tag;
        this.verbose = verbose;
    }

    /**
     * Allow toggling on verbose e.g. by command or option
     */
    public setVerbose(verbose: boolean) {
        this.verbose = verbose;
    }

    /**
     * Always prints. Use for major messages
     */
    public out(...args: any[]) {
        console.log(colors.green(`[${this.tag}]`), ...args);
    }

    /**
     * For verbose stuff and details and annoying things
     */
    public log(...args: any[]) {
        if (!this.verbose) return;

        console.log(colors.blue(`[${this.tag}]`), ...args.map((a) => colors.dim(a)));
    }

    /**
     * Stylized as red to be error-tastique
     */
    public error(...args: any[]) {
        console.log(colors.red(`[${this.tag}:error]`), ...args);
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

    /**
     * Dumps out everything stored with queueError
     */
    public dump() {
        if (this.errors.length === 0) return;

        this.error('Exiting. Errors encountered:');
        this.errors.map((error, i) => {
            this.out(`‣ ${i + 1}:`, error);
        });
    }

    public isVerbose() {
        return this.verbose;
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

const overflow = (str: string, max = 40) => (str.length > max ? str.slice(0, max - 1) + '…' : str);
