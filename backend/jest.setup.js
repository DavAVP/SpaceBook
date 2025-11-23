// Jest setup file
require('dotenv').config();

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}