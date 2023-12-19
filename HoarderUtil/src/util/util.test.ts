import { getExt, parseStringToTags } from './helpers';

describe('utils', () => {
  describe('getExt', () => {
    const extDummyData = [
      ['agua.jpg', 'jpg'],
      ['nero...tar', 'tar'],
      ['homeworkFolder', ''],
    ];

    test.each(extDummyData)(
      'getExt gets from "%s"',
      (fileName, expectedExt) => {
        const ext = getExt(fileName);

        expect(ext).toEqual(expectedExt);
      }
    );
  });

  describe('parseStringToTags', () => {
    const nameParse: Array<[string, string, any]> = [
      [
        '%artist% - %title%',
        'Pain of Salvation - Icon',
        { artist: 'Pain of Salvation', title: 'Icon' },
      ],
      [
        '%artist% - %title%',
        'Insomnium - White Christ - demo',
        { artist: 'Insomnium', title: 'White Christ - demo' },
      ],
      [
        '%band%> %songName%',
        'The Killers> West Hills',
        { band: 'The Killers', songName: 'West Hills' },
      ],
      ['%artist%: %title%', 'Amorphis - Golden Elk', null],
      ['%artist% - %title% - %album%', 'Måneskin - Timezone', null],
    ];

    test.each(nameParse)('name to tag %s to %s', (pattern, input, expected) => {
      const result = parseStringToTags(pattern, input);

      expect(result).toEqual(expected);
    });
  });
});
