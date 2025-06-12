import { fileNameSafeTitleReplace } from './nameTag.helpers';

describe('fileNameSafeTitleReplace', () => {
    it('returns original filename if fileSafeTitle equals metadataTitle', () => {
        const result = fileNameSafeTitleReplace('my_file.txt', 'my_file.txt');
        expect(result).toBe('my_file.txt');
    });

    it('returns original filename if fileSafeFilename does not include fileSafeTitle', () => {
        const result = fileNameSafeTitleReplace('abc_def.txt', 'xyz');
        expect(result).toBe('abc_def.txt');
    });

    it('returns metadataTitle if too many replacement characters', () => {
        // filename has 6 underscores out of 12 chars (50%)
        const result = fileNameSafeTitleReplace('a_b_c_d_e_f.txt', 'abcdef');
        expect(result).toBe('abcdef');
    });

    it('replaces fileSafeTitle in filename with metadataTitle', () => {
        // fileSafeFilename: "my_title_file.txt", fileSafeTitle: "title"
        const result = fileNameSafeTitleReplace('my_title_file.txt', 'title');
        expect(result).toBe('my_title_file.txt'.replace('title', 'title'));
    });

    it('replaces fileSafeTitle in filename with metadataTitle (with spaces)', () => {
        // fileSafeFilename: "my_title_file.txt", fileSafeTitle: "title"
        const result = fileNameSafeTitleReplace('my_title_file.txt', 'title');
        expect(result).toBe('my_title_file.txt'.replace('title', 'title'));
    });

    it('returns original filename if fileSafeTitle not found in fileSafeFilename', () => {
        const result = fileNameSafeTitleReplace('my_file.txt', 'notfound');
        expect(result).toBe('my_file.txt');
    });

    it('handles empty filename and metadataTitle', () => {
        const result = fileNameSafeTitleReplace('', '');
        expect(result).toBe('');
    });
});
