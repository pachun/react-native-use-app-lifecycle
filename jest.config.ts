import type { Config } from "jest"
import * as fsPromises from "fs/promises"

const setupFilesAfterEnv = async (): Promise<string[]> => {
  const setupFilesAfterEnvPath = "./tests/helpers/jest/setupFilesAfterEnv/"
  return (await fsPromises.readdir(`${setupFilesAfterEnvPath}`)).map(
    fileName => `${setupFilesAfterEnvPath}/${fileName}`,
  )
}

const setupFiles = async (): Promise<string[]> => {
  const setupFilesPath = "./tests/helpers/jest/setupFiles/"
  return (await fsPromises.readdir(`${setupFilesPath}`)).map(
    fileName => `${setupFilesPath}/${fileName}`,
  )
}

const transformIgnorePatterns = [
  "node_modules/(?!(@react-native|react-native)/)",
]

const collectCoverageFrom = ["./src/**", "!src/types/**"]

const minimumCoveragePercentage = 100
const coverageThreshold = {
  global: {
    lines: minimumCoveragePercentage,
    functions: minimumCoveragePercentage,
    branches: minimumCoveragePercentage,
    statements: minimumCoveragePercentage,
  },
}

export default async (): Promise<Config> => {
  return {
    projects: [
      {
        preset: "react-native",
        setupFilesAfterEnv: await setupFilesAfterEnv(),
        setupFiles: await setupFiles(),
      },
    ],
    transform: {
      "^.+\\.(ts|tsx|js|jsx)$": "babel-jest",
    },
    transformIgnorePatterns,
    coverageProvider: "v8",
    collectCoverageFrom,
    coverageThreshold,
    coverageReporters: ["json-summary", "text", "lcov"],
  }
}
