const webpush = require('../webpush');

// Mock para evitar configuración real
jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn()
}));

describe('WebPush Module', () => {
  it('debería exportar el módulo web-push correctamente', () => {
    expect(webpush).toBeDefined();
    expect(typeof webpush.sendNotification).toBe('function');
  });

  it('debería poder configurar VAPID details', () => {
    // Verificar que se puede importar sin errores
    expect(() => require('../webpush')).not.toThrow();
  });
});