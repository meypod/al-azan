/** @type {import('jest').Config} */
const config = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  fakeTimers: {
    legacyFakeTimers: true,
  },
  forceExit: true,
  // testRunner: 'jasmine2',
  // for aliases
  modulePaths: ['.'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/default_require_for_non_js.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/default_require_for_non_js.js',
  },
  testPathIgnorePatterns: ['notifee_fork/'],
  coveragePathIgnorePatterns: ['notifee_fork/'],
};

module.exports = config;
