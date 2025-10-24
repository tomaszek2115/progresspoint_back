import "./src/test/setupEnv";
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFiles: ["./src/test/setupEnv.ts"],
  moduleFileExtensions: ['ts', 'js'],
  clearMocks: true,
  verbose: true,
};

export default config;