=======
# SpaceBook

SpaceBook es una plataforma web para gestionar reservas de espacios dentro de una institución. Incluye un panel administrativo para publicar y administrar espacios, flujos orientados a clientes para gestionar reservas y un backend ligero que centraliza las notificaciones push mediante Supabase y Web Push.

## Arquitectura
- **Frontend**: React + TypeScript con Vite (carpeta `spacebook/`). Consume Supabase directamente para autenticación/datos y expone una PWA con notificaciones push.
- **Backend**: Express (carpeta `backend/`). Expone endpoints REST para gestionar suscripciones push y para disparar notificaciones dirigidas.
- **Infraestructura**: Supabase para autenticación/perfilado, Azure Static Web Apps (flujo GitHub Actions) para desplegar el frontend y un runtime Node para el backend (Azure Functions o contenedor). Web Push usa llaves VAPID instaladas como variables de entorno.

## Características
- Gestión de reservas y espacios con flujos diferenciados para invitados, clientes y administradores.
- Notificaciones push a usuarios y administradores vía Service Worker y backend Express.
- Integración con Supabase (auth, perfiles, tablas de suscripción push).
- PWA con Workbox para cacheo básico y entrega offline limitada.

## Requisitos previos
- Node.js 18 LTS o superior.
- npm 9 o superior.
- Cuenta y proyecto en Supabase con las tablas `profiles` y `push_subscriptions` configuradas.
- Llaves VAPID para Web Push.

## Configuración del entorno

### Variables de entorno del frontend (`spacebook/.env`)
```
VITE_SUPABASE_URL=<URL del proyecto Supabase>
VITE_SUPABASE_ANON_KEY=<Anon public key>
VITE_API_URL=<URL pública del backend Express>
VITE_VAPID_PUBLIC_KEY=<Llave pública VAPID en base64>
```

### Variables de entorno del backend (`backend/.env`)
```
PORT=<puerto opcional, default 8080>
FRONTEND_URL=<URL permitida adicional para CORS>
SUPABASE_URL=<URL del proyecto Supabase>
SUPABASE_SERVICE_ROLE_KEY=<Service role key de Supabase>
PUBLIC_VAPID_KEY=<Llave pública VAPID>
PRIVATE_VAPID_KEY=<Llave privada VAPID>
VAPID_SUBJECT=mailto:contacto@dominio.com
```

> Nota: el backend acepta variantes `VITE_` para las llaves VAPID. Define al menos `PUBLIC_VAPID_KEY` y `PRIVATE_VAPID_KEY` para habilitar Web Push.

## Instalación
```bash
git clone <repo>
cd SpaceBook-8

# Frontend
cd spacebook
npm install

# Backend
cd ../backend
npm install
```

## Ejecución local
1. **Backend**
	```bash
	cd backend
	npm start
	```

2. **Frontend**
	```bash
	cd spacebook
	npm run dev
	```


3. Registra el Service Worker (solo en HTTPS o `localhost`) y prueba el flujo de notificaciones creando suscripciones desde una sesión autenticada.

## Pruebas
- Frontend: `npm run test` (Vitest + React Testing Library).
- Backend: `npm test` (Jest + Supertest).

## Flujo CI/CD y ramas
- **Estrategia GitHub Flow**
	1. Crea una rama descriptiva (`feature/<feature>`, `fix/<issue>`) desde `main`.
	2. Commits pequeños y con mensajes en imperativo.
	3. Abre un Pull Request hacia `main`, solicita revisión y verifica que GitHub Actions quede en verde.
	4. Mergea con `squash` o `rebase` cuando la revisión y los pipelines aprueban; elimina la rama.
	5. Etiqueta la versión si procede y sigue con el siguiente feature.
- **Automatización**: el workflow [Full CI/CD (Frontend + Backend)](.github/workflows/node.js.yml) ejecuta lint/test/build en cada push/PR.
- **Staging automatizado**: el workflow [Azure Static Web Apps CI/CD](../.github/workflows/azure-static-web-apps-nice-pond-0cf73d20f.yml) se activa con la rama `staging` y publica automáticamente en la Static Web App `nice-pond-0cf73d20f`. Ese despliegue sirve como entorno de staging para QA; cuando se valida, se fusiona `staging` → `main` para promover a producción.
- **Producción**: tras validar en staging, el job `deploy_frontend` del workflow principal publica en Vercel; el job [Build and Deploy to Cloud Run](../.github/workflows/build-and-deploy-cloudrun.yml) mantiene el contenedor alternativo.

## Monitoreo, métricas y registros
- Frontend: revisar logs de Azure Static Web Apps y Cloud Run (Cloud Logging) para errores en runtime; Vercel y Render ofrecen dashboards con métricas básicas.
- Backend: Render expone logs en tiempo real; Supabase registra auditorías de autenticación y RLS.
- Alertas manuales: configurar notificaciones en cada plataforma (Render, Azure, Google Cloud) para fallos de despliegue o errores 5xx.

## Respaldo y rollback
- **Base de datos Supabase**: habilita el backup automático en el panel del proyecto y registra un recordatorio semanal para exportar un dump `.sql` manual (almacenado en una carpeta privada de OneDrive/Drive). Mantén al menos los últimos 3 dumps.
- **Artefactos frontend/backend**: cada build queda versionada por commit (`dist/` y contenedor). Para un rollback basta con redeployar el commit anterior desde GitHub Actions (botón “Re-run job”), reactivar el deployment anterior en Vercel o volver a apuntar `staging` al commit estable antes de fusionarlo con `main`.
- **Variables de entorno**: mantén una copia cifrada de los `.env` en el repo privado `infra-config` y exporta la configuración actual de cada plataforma antes de realizar cambios mayores.
- **Plan de recuperación**: en caso de fallo en producción, cambia el tráfico a la instancia de staging (Azure) mientras restauras Vercel con el último deployment estable y reimportas el dump de Supabase si la data quedó comprometida.

## Seguridad y calidad
- Secretos gestionados como variables de entorno/secrets en cada plataforma y en GitHub Actions.
- Codacy analiza el repositorio en cada push para detectar vulnerabilidades y malas prácticas; revisar panel de Codacy tras cada release.
- HTTPS provisto por Vercel, Azure y Cloud Run; Supabase y Web Push requieren URLs seguras.

## Construcción y despliegue
- Frontend: `npm run build` genera artefactos en `spacebook/dist/`. El repositorio incluye `spacebook/vite.config.ts` y `spacebook/vercel.json` para despliegues PWA y vercel/azure.
- Backend: el entrypoint es `backend/src/index.js`. Para entornos serverless usa `serverless-http` o empaqueta como contenedor. Ajusta `publish-profile.xml` si despliegas a Azure.
- Pipeline: el workflow `[.github/workflows/azure-static-web-apps-nice-pond-0cf73d20f.yml](../.github/workflows/azure-static-web-apps-nice-pond-0cf73d20f.yml)` automatiza el despliegue a Azure Static Web Apps.

## Documentación adicional
- Documentación de API: consulta `[backend/openapi.yaml](../backend/openapi.yaml)`.
- Guía de contribución: ver `[CONTRIBUTING.md](../CONTRIBUTING.md)`.
- Architectural Decision Records: encuentra las decisiones clave en `[docs/adr](../docs/adr)`.

## Licencia
Proyecto académico. Define una licencia explícita antes de distribuir públicamente.

