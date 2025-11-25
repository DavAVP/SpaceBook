// Jest setup file
require('dotenv').config();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

// Mock global de Supabase
jest.mock('./src/supabase', () => require('./src/__mocks__/supabase'));

// Evitar logs en tests
jest.spyOn(console, 'log').mockImplementation(() => {});


