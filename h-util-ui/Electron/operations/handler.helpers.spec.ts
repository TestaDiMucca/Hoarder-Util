import fs from 'fs/promises';
import { DataDict, populateDataDict, sanitizeStringForFilename } from './handler.helpers';
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

describe('sanitizeStringForFilename', () => {
    it('replaces special characters with underscores', () => {
        const input = 'file@name#with$special%chars!';
        const sanitized = sanitizeStringForFilename(input);
        expect(sanitized).toEqual('file_name_with_special_chars_');
    });

    it('keeps valid characters intact', () => {
        const input = 'valid-file_name(123).txt';
        const sanitized = sanitizeStringForFilename(input);
        expect(sanitized).toEqual('valid-file_name(123).txt');
    });

    it('replaces consecutive special characters with multiple underscores', () => {
        const input = 'file佢話我中國豬嗰個死鬼佬.txt';
        const sanitized = sanitizeStringForFilename(input);
        expect(sanitized).toEqual('file___________.txt');
    });

    it('does not modify strings without special characters', () => {
        const input = 'simple_filename.txt';
        const sanitized = sanitizeStringForFilename(input);
        expect(sanitized).toEqual('simple_filename.txt');
    });
});
