module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>'],
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '@shared/(.*)': '<rootDir>/common/$1',
        '@common/(.*)': '<rootDir>/Electron/packages/$1',
        '@util/(.*)': '<rootDir>/Electron/util/$1',
    },
};
