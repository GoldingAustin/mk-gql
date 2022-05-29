module.exports = {
  preset: 'ts-jest/presets/default-esm',
  testPathIgnorePatterns: ["/node_modules/", "/examples/"],
  watchPathIgnorePatterns: [
    "/tests/lib/todos/models/",
    "/tests/lib/unionTypes/models/"
  ],
  moduleNameMapper: {
    "^mk-gql$": "<rootDir>/packages/core/src/mk-gql.ts"
  }
}
