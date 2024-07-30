import fs from 'fs';

import output from '@util/output';

export const loadJsonStore = async (dataFilePath: string) => {
    try {
        output.log('[loadJsonStorage] Loading user data from JSON');
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('[loadJsonStore] Error loading:', err);
        return {};
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
