import fs from 'fs/promises';
import { DataDict, populateDataDict } from './handler.helpers';
import { RenameTemplates } from '@shared/common.constants';

describe('DataDict helper', () => {
    const filePath = 'fake.png';
    let statSpy: jest.SpyInstance;

    beforeEach(() => {
        // Spy on fs.stat
        statSpy = jest.spyOn(fs, 'stat');
    });

    afterEach(() => {
        // Restore the original implementation
        statSpy.mockRestore();
    });

    it('does nothing if no tag', async () => {
        const dataDict: DataDict = {};

        const calls = statSpy.mock.calls;

        await populateDataDict({ dataDict, tag: 'fake', filePath });

        expect(Object.values(dataDict).length).toEqual(0);
        expect(calls.length).toEqual(0);
    });

    it('populates only when needed', async () => {
        const dataDict: DataDict = {};

        const calls = statSpy.mock.calls;
        const mockStats: Partial<Awaited<ReturnType<typeof fs.stat>>> = {
            ctime: new Date(),
            size: 1024,
        };

        statSpy.mockImplementation(async (_) => mockStats);

        await populateDataDict({ dataDict, tag: RenameTemplates.DateCreated, filePath });

        expect(Object.values(dataDict).length).toBeGreaterThan(0);
        expect(calls.length).toBeGreaterThan(0);
    });
});
