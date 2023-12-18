import { getExt } from './helpers';

describe('utils', () => {
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
