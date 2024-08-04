export const printf = (message: string) => console.log(message);

export { Output } from './output';

export const randomFromArray = <T>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const chunkArray = <T>(arr: T[], chunkSize: number) => {
    const result: Array<T>[] = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        result.push(arr.slice(i, i + chunkSize));
    }
    return result;
};

export const sleep = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

type Resolvable<R> = R | PromiseLike<R>;

export const promises = {
    map: async <T, R>(
        items: readonly T[],
        callback: (item: T, idx: number) => Resolvable<R>,
        options?: { concurrency?: number }
    ) => {
        const itemsWithIndex = items.map((v, i) => ({ v, i }));
        const batches = options?.concurrency ? chunkArray(itemsWithIndex, options.concurrency) : [itemsWithIndex];
        const results: R[] = [];

        for (const batch of batches) {
            results.push(...(await Promise.all(batch.map(({ v, i }) => callback(v, i)))));
        }

        return results;
    },

    mapSeries: async <T, R>(items: readonly T[], callback: (item: T, index: number) => Resolvable<R>) => {
        const results: R[] = [];
        let idx = 0;

        for (const item of items) {
            results.push(await callback(item, idx));
            idx++;
        }

        return results;
    },

    reduce: async <T, R>(items: readonly T[], callback: (out: R, item: T, i?: number) => Resolvable<R>, init: R) => {
        let out = init;
        let i = 0;

        for (const item of items) {
            out = await callback(out, item, i);
            i++;
        }

        return out;
    },

    each: async <T>(
        items: readonly T[],
        callback: (item: T) => Resolvable<unknown>,
        options?: { concurrency?: number }
    ) => {
        if (!options?.concurrency || options.concurrency <= 0) {
            for (const item of items) {
                await callback(item);
            }

            return;
        }

        /* Handle concurrency */
        const itemsWithIndex = items.map((v) => ({ v }));
        const batches = chunkArray(itemsWithIndex, options.concurrency);

        for (const batch of batches) {
            await Promise.all(batch.map(({ v }) => callback(v)));
        }
    },

    filter: async <T>(items: readonly T[], callback: (item: T, index: number) => Resolvable<boolean>) => {
        const results: T[] = [];
        let idx = 0;

        for (const item of items) {
            const shouldKeep = await callback(item, idx);

            if (shouldKeep) {
                results.push(item);
            }

            idx++;
        }

        return results;
    },
};

/**
 * Measure the time it takes to run a callback
 */
export const withTimer = async <T>(cb: () => Promise<T>, onDone: (time: number) => void) => {
    const start = Date.now();

    const result = await cb();

    const time = Date.now() - start;

    onDone(time);

    return result;
};

export const checkFilenameExcluded = (fileName: string, pattern: string) => {
    try {
        const re = new RegExp(pattern, 'i');

        return fileName.search(re) >= 0;
    } catch (e) {
        return fileName.toLowerCase().includes(pattern.toLowerCase());
    }
};

export const parseNumber = (input: string): number | null => {
    const num = Number(input);
    return isNaN(num) ? null : num;
};

/**
 * Run async things detached so the parent method won't await it.
 * Good if child methods need to run sequentially
 */
export const detachPromise = <T>(opts: { cb: () => Promise<T>; onDone?: () => void; onError?: (e: Error) => void }) => {
    opts.cb()
        .then(() => opts.onDone?.())
        .catch((e) => opts.onError?.(e));
};
