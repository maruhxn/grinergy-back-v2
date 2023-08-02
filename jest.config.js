/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 30000,
  testPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/dist/", // 추가
  ],
  moduleNameMapper: {
    "@/(.*)$": "<rootDir>/src/$1",
  },
};
