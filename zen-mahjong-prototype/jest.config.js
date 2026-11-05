module.exports = {
  preset: 'jest-expo',
  roots: ['<rootDir>/packages', '<rootDir>/apps/mobile'],
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/apps/mobile/src/$1' },
  collectCoverageFrom: ['packages/**/*.{ts,tsx}', '!**/index.ts'],
};
