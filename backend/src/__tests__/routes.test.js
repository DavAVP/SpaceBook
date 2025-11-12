const request = require('supertest');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: 'http://localhost:4173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(require('../routes/index'));

// Mock del módulo webpush
jest.mock('../webpush', () => ({
  sendNotification: jest.fn().mockResolvedValue({ success: true }),
}));

const webPush = require('../webpush');

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /subscription', () => {
    it('debería agregar una nueva suscripción válida', async () => {
      const suscripcion = {
        endpoint: 'https://test.endpoint.com',
        keys: {
          p256dh: 'test-p256dh',
          auth: 'test-auth'
        },
        role: 'cliente',
        userId: 'test-user-123'
      };

      const response = await request(app)
        .post('/subscription')
        .send(suscripcion)
        .expect(200);

      expect(response.body).toEqual({ ok: true });
    });

    it('debería rechazar suscripción sin endpoint', async () => {
      const suscripcionInvalida = {
        keys: {
          p256dh: 'test-p256dh',
          auth: 'test-auth'
        }
      };

      const response = await request(app)
        .post('/subscription')
        .send(suscripcionInvalida)
        .expect(400);

      expect(response.body.error).toBe('Suscripción inválida');
    });

    it('debería normalizar el rol correctamente', async () => {
      const testCases = [
        { role: 'ADMIN', expected: 'admin' },
        { role: 'cliente', expected: 'cliente' },
        { is_admin: true, expected: 'admin' },
        { is_admin: false, expected: 'cliente' },
        { role: true, expected: 'admin' },
        { role: false, expected: 'cliente' },
        { role: 'invalid', expected: 'cliente' }
      ];

      for (const testCase of testCases) {
        const suscripcion = {
          endpoint: `https://test${Math.random()}.endpoint.com`,
          keys: { p256dh: 'test', auth: 'test' },
          ...testCase
        };

        await request(app)
          .post('/subscription')
          .send(suscripcion)
          .expect(200);
      }
    });
  });

  describe('POST /new-message', () => {
    beforeEach(async () => {
      
      await request(app)
        .post('/subscription')
        .send({
          endpoint: 'https://admin.endpoint.com',
          role: 'admin',
          userId: 'admin-1'
        });

      await request(app)
        .post('/subscription')
        .send({
          endpoint: 'https://cliente.endpoint.com',
          role: 'cliente',
          userId: 'cliente-1'
        });
    });

    it('debería enviar notificación por rol', async () => {
      const mensaje = {
        message: 'Test message',
        role: 'admin',
        title: 'Test Title'
      };

      const response = await request(app)
        .post('/new-message')
        .send(mensaje)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sent).toBeGreaterThan(0);
      expect(webPush.sendNotification).toHaveBeenCalled();
    });

    it('debería enviar notificación por userId', async () => {
      const mensaje = {
        message: 'Test message',
        userId: 'cliente-1',
        title: 'Test Title'
      };

      const response = await request(app)
        .post('/new-message')
        .send(mensaje)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sent).toBeGreaterThan(0);
      expect(webPush.sendNotification).toHaveBeenCalled();
    });

    it('debería fallar sin mensaje', async () => {
      const response = await request(app)
        .post('/new-message')
        .send({ role: 'admin' })
        .expect(400);

      expect(response.body.error).toBe('Falta el mensaje');
    });

    it('debería fallar si no hay suscriptores', async () => {
      const mensaje = {
        message: 'Test message',
        role: 'nonexistent'
      };

      const response = await request(app)
        .post('/new-message')
        .send(mensaje)
        .expect(400);

      expect(response.body.error).toBe('No hay suscriptores registrados para este rol/usuario');
    });
  });

  describe('POST /new-reservation-admin', () => {
    beforeEach(async () => {
      // Agregar suscripción de admin
      await request(app)
        .post('/subscription')
        .send({
          endpoint: 'https://admin.reservation.endpoint.com',
          role: 'admin',
          userId: 'admin-reservation'
        });
    });

    it('debería notificar a admins sobre nueva reserva', async () => {
      const reserva = {
        message: 'Nueva reserva de espacio',
        title: 'Nueva Reserva'
      };

      const response = await request(app)
        .post('/new-reservation-admin')
        .send(reserva)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sent).toBeGreaterThan(0);
      expect(webPush.sendNotification).toHaveBeenCalled();
    });

    it('debería fallar sin mensaje', async () => {
      const response = await request(app)
        .post('/new-reservation-admin')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Falta el mensaje');
    });
  });

  describe('POST /new-penalization-admin', () => {
    beforeEach(async () => {
      // Agregar suscripción de admin
      await request(app)
        .post('/subscription')
        .send({
          endpoint: 'https://admin.penalization.endpoint.com',
          role: 'admin',
          userId: 'admin-penalization'
        });
    });

    it('debería notificar a admins sobre penalización', async () => {
      const penalizacion = {
        message: 'Nueva penalización aplicada',
        title: 'Penalización'
      };

      const response = await request(app)
        .post('/new-penalization-admin')
        .send(penalizacion)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.sent).toBeGreaterThan(0);
      expect(webPush.sendNotification).toHaveBeenCalled();
    });

    it('debería fallar sin mensaje', async () => {
      const response = await request(app)
        .post('/new-penalization-admin')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Falta el mensaje');
    });
  });

  describe('POST /subscription/remove', () => {
    it('debería remover suscripción existente', async () => {
      const endpoint = 'https://to-remove.endpoint.com';
      
      await request(app)
        .post('/subscription')
        .send({
          endpoint: endpoint,
          role: 'cliente'
        });

      const response = await request(app)
        .post('/subscription/remove')
        .send({ endpoint })
        .expect(200);

      expect(response.body.removed).toBe(1);
    });

    it('debería fallar sin endpoint', async () => {
      const response = await request(app)
        .post('/subscription/remove')
        .send({})
        .expect(400);

      expect(response.body.error).toBe('Se requiere endpoint');
    });
  });

  describe('Error handling', () => {
    it('debería manejar errores de webpush', async () => {
      webPush.sendNotification.mockRejectedValueOnce(new Error('Network error'));

      await request(app)
        .post('/subscription')
        .send({
          endpoint: 'https://error.endpoint.com',
          role: 'admin'
        });

      const response = await request(app)
        .post('/new-message')
        .send({
          message: 'Test message',
          role: 'admin'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('debería manejar suscripción expirada (410)', async () => {
      const error410 = new Error('Gone');
      error410.statusCode = 410;
      webPush.sendNotification.mockRejectedValueOnce(error410);

      // Agregar suscripción
      await request(app)
        .post('/subscription')
        .send({
          endpoint: 'https://expired.endpoint.com',
          role: 'admin'
        });

      const response = await request(app)
        .post('/new-message')
        .send({
          message: 'Test message',
          role: 'admin'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});