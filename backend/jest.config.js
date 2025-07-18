module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 60000, // Augmentation du timeout à 60 secondes
  // Configuration ajoutée pour charger notre fichier de setup
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/'
  ]
};
