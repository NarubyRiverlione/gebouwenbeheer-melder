module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.cjs'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.cjs$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node', 'cjs']
};
