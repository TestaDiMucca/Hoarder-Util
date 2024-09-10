import { checkAgainstRegex, parseStringToTags } from './helpers';

describe('utils', () => {
    describe('parseStringToTags', () => {
        const nameParse: Array<[string, string, any]> = [
            ['%artist% - %title%', 'Pain of Salvation - Icon', { artist: 'Pain of Salvation', title: 'Icon' }],
            [
                '%artist% - %title%',
                'Insomnium - White Christ - demo',
                { artist: 'Insomnium', title: 'White Christ - demo' },
            ],
            ['%band%> %songName%', 'The Killers> West Hills', { band: 'The Killers', songName: 'West Hills' }],
            ['%artist%: %title%', 'Amorphis - Golden Elk', null],
            ['%artist% - %title% - %album%', 'Måneskin - Timezone', null],
        ];

        test.each(nameParse)('name to tag %s to %s', (pattern, input, expected) => {
            const result = parseStringToTags(pattern, input);

            expect(result).toEqual(expected);
        });
    });

    describe('checkAgainstRegex', () => {
        test.each(['balbalbal.jpg', 'yhtqha5.png', 'wanWANwan.mov'])('matches partial string in %s', (fileName) => {
            const partial = fileName.substring(fileName.length - 4, fileName.length - 1);

            const result = checkAgainstRegex(fileName, partial);

            expect(result).toBeTruthy();
        });

        test.each(['ragnar.mp3', 'zolberg.wav', 'sign.gif'])('will not match random shit in %s', (fileName) => {
            const corrupted = 'COPY_ov_' + fileName;

            const result = checkAgainstRegex(fileName, corrupted);

            expect(result).toBeFalsy();
        });

        test('ignores casing', () => {
            const fileName = 'agua-san.jpg';

            const result = checkAgainstRegex(fileName, fileName.toUpperCase());

            expect(result).toBeTruthy();
        });

        const regExCases: Array<[string, boolean]> = [
            ['45-12-h.jpg', true],
            ['99-5-j.rar', true],
            ['eega.avi', false],
        ];

        test.each(regExCases)('uses regex too in %s', (fileName, shouldMatch) => {
            const matchStr = '^\\d{1,2}\\D\\d{1,2}\\D';

            const result = checkAgainstRegex(fileName, matchStr);
            expect(result).toEqual(shouldMatch);
        });
    });
});
