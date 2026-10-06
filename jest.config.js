module.exports = {
  // Use Node environment for server tests
  testEnvironment: "node",
  
  // Find tests in these patterns
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/tests/**/*.test.ts",
    "**/tests/**/*.unit.test.ts",
    "**/tests/**/*.integration.test.ts",
    "**/tests/**/*.e2e.test.ts",
  ],
  
  // File extensions to look for
  moduleFileExtensions: ["ts", "js", "json"],
  
  // Transform TypeScript
  transform: {
    "^.+\\.ts$": ["ts-jest", {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  
  // Setup files
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  
  // Module paths for imports
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/client/src/$1",
    "^@server/(.*)$": "<rootDir>/server/$1",
  },
  
  // Coverage reporting
  collectCoverageFrom: [
    "client/src/**/*.{ts,tsx}",
    "server/**/*.{ts}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/__tests__/**",
  ],
  
  // Coverage thresholds (to increase over time)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  
  // Ignore patterns
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  
  // Verbose output
  verbose: true,
  
  // Timeout per test
  testTimeout: 30000,
};
