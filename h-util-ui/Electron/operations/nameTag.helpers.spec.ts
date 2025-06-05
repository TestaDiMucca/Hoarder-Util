import { fileNameSafeTitleReplace } from './modules/nameTag.helpers';

// By GPT ;)
describe('fileNameSafeTitleReplace', () => {
    it('returns filename if fileSafeTitle equals filename', () => {
        expect(fileNameSafeTitleReplace('My_Title', 'My_Title')).toBe('My_Title');
    });

    it('returns filename if fileSafeTitle is not in filename', () => {
        expect(fileNameSafeTitleReplace('SomeFileName', 'AnotherTitle')).toBe('SomeFileName');
    });

    it('replaces fileSafeTitle in filename with metadataTitle', () => {
        expect(fileNameSafeTitleReplace('My_Title_2024', 'My Title')).toBe('My Title_2024');
    });

    it('replaces all occurrences of fileSafeTitle in filename', () => {
        expect(fileNameSafeTitleReplace('My_Title_and_My_Title', 'My Title')).toBe('My Title_and_My Title');
    });

    it('handles special characters in metadataTitle', () => {
        expect(fileNameSafeTitleReplace('My_Title_2024', 'My/Title')).toBe('My/Title_2024');
    });

    it('returns filename unchanged if metadataTitle is empty', () => {
        expect(fileNameSafeTitleReplace('SomeFile', '')).toBe('SomeFile');
    });

    it('returns filename unchanged if filename is empty', () => {
        expect(fileNameSafeTitleReplace('', 'Some Title')).toBe('');
    });

    it('handles both filename and metadataTitle with special characters', () => {
        expect(fileNameSafeTitleReplace('My_Title_#1', 'My@Title')).toBe('My@Title_#1');
    });

    it('does not replace partial matches', () => {
        expect(fileNameSafeTitleReplace('My_Title_Extra', 'My Tit')).toBe('My_Title_Extra');
    });
});
