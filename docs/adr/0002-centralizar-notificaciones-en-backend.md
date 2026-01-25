# 0002 - Centralizar notificaciones push en backend Express

- Estado: Aceptada
- Fecha: 2026-01-25

## Contexto
El frontend necesita disparar notificaciones push segmentadas a clientes y administradores. Enviar las notificaciones directamente desde el navegador expone llaves VAPID y dificulta validar roles.

## Decisión
Implementar un backend mínimo con Express que:
- Administre la tabla `push_subscriptions` en Supabase.
- Exponga endpoints seguros (`/new-message`, `/new-reservation-admin`, `/new-penalization-admin`).
- Normalice roles y depure suscripciones inválidas antes de enviar notificaciones usando `web-push`.

## Consecuencias
- Ventajas: Llaves VAPID protegidas en el servidor, control de roles y auditoría centralizada.
- Riesgos: Punto único de falla; se debe desplegar y monitorear el backend.
- Mitigaciones: Añadir pruebas con Jest/Supertest y monitoreo básico (logs, alertas) en la plataforma de despliegue.
