module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js', // Excluir el archivo principal del servidor
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
};