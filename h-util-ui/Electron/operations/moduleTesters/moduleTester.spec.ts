import fs from 'fs/promises';
import { ProcessingModuleType } from '@shared/common.types';
import { renameTest } from './renameTest';

describe('rename tester', () => {
    const filePath = 'fake.png';

    let statSpy: jest.SpyInstance;

    beforeEach(() => {
        statSpy = jest.spyOn(fs, 'stat');
    });

    afterEach(() => {
        statSpy.mockRestore();
    });

    test('runs and returns data', async () => {
        const result = await renameTest({
            type: ProcessingModuleType.dynamicRename,
            filePaths: [filePath],
            templateString: '%slugified%',
        });

        expect(result.length).toBeGreaterThan(0);
        expect(result[0]).toContain('fake');
    });
});
