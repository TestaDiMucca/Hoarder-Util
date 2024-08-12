class Output {
    tag = 'main';
    verbose = false;

    /**
     * Always prints. Use for major messages
     */
    public out(...args: any[]) {
        console.log(`[${this.tag}]`, ...args);
    }

    /**
     * For verbose stuff and details and annoying things
     */
    public log(...args: any[]) {
        if (!this.verbose) return;

        console.log(`[${this.tag}]`, ...args.map((a) => a));
    }

    /**
     * Stylized as red to be error-tastique
     */
    public error(...args: any[]) {
        console.log(`[${this.tag}:error]`, ...args);
    }
}

export default new Output();
