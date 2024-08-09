import fs from 'fs';

import output from '@util/output';

/*
 * Due to low data to store, and low IOPs, just using a simple json file store.
 */

export const loadJsonStore = async <T>(dataFilePath: string) => {
    try {
        output.log('[loadJsonStorage] Loading user data from JSON');
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data) as T;
    } catch (err) {
        console.error('[loadJsonStore] Error loading:', err);
        return null;
    }
};

export const saveJsonStore = (dataFilePath: string, data: string) => {
    try {
        output.log('[saveJsonStorage] Saving user data to JSON');
        fs.writeFileSync(dataFilePath, data);
    } catch (err) {
        console.error('[saveJsonStore] Error saving:', err);
    }
};
