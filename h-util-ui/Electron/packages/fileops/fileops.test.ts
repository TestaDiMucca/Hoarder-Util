import { getExt } from './index';

describe('file ops', () => {
    describe('getExt', () => {
        const extDummyData = [
            ['agua.jpg', 'jpg'],
            ['nero...tar', 'tar'],
            ['homeworkFolder', ''],
        ];

        test.each(extDummyData)('getExt gets from "%s"', (fileName, expectedExt) => {
            const ext = getExt(fileName);

            expect(ext).toEqual(expectedExt);
        });
    });
});
