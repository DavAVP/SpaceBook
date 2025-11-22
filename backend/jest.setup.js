// Jest setup file
// Configurar variables de entorno para tests usando las mismas del archivo .env
require('dotenv').config();

// Solo sobrescribir si no están definidas (para mantener las del .env)
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}