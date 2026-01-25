# Guía de contribución

Gracias por tu interés en colaborar con SpaceBook. Este documento resume el flujo recomendado para proponer cambios en el frontend (React/Vite) y el backend (Express).

## Requisitos previos
- Node.js 18 LTS o superior y npm 9+.
- Acceso al repositorio y al proyecto de Supabase utilizado en desarrollo.
- Opcional: cuenta de Azure o Vercel si deseas probar despliegues propios.

## Flujo de trabajo recomendado
1. **Crea un issue** describiendo el problema o la mejora.
2. **Haz un fork o crea una rama** desde `main` siguiendo la convención `feature/nombre-corto`, `fix/descripcion` o `docs/tema`.
3. **Instala dependencias** en ambos proyectos si afecta a frontend/back:
   ```bash
   cd spacebook
   npm install
   cd ../backend
   npm install
   ```
4. **Configura variables de entorno** según `spacebook/README.md`.
5. **Desarrolla y prueba localmente**:
   - Frontend: `npm run dev`, `npm run test`, `npm run lint`.
   - Backend: `npm start`, `npm test`.
6. **Actualiza o crea pruebas** cuando introduces lógica nueva.
7. **Verifica el formato** antes de hacer commit (`npm run lint` en frontend; usa Prettier/ESLint configuración base si es necesario).
8. **Commits claros** usando el idioma del cambio (ES/EN). Ej.: `feat: soporte de penalizaciones múltiples`.
9. **Pull Request** hacia `main`:
   - Completa la plantilla indicando alcance, pruebas y riesgos.
   - Adjunta capturas o gifs cuando se trate de UI.
   - Referencia issues cerrados.

## Estándares de código
- Frontend: React con TypeScript, componentes funcionales y hooks. Evita lógica compleja sin separar en hooks o servicios.
- Backend: módulos CommonJS, Express para rutas, manejo de errores con `try/catch` y respuestas JSON claras.
- Usa comentarios breves solo cuando la intención no sea evidente.

## Pruebas y cobertura
- Frontend: Vitest + Testing Library (`npm run test`). Añade pruebas para componentes, hooks y utilidades.
- Backend: Jest + Supertest (`npm test`). Cubre rutas y servicios críticos como notificaciones.
- Ejecuta `npm run test:coverage` en backend si modificas lógica de notificaciones.

## Documentación
- Mantén actualizado `spacebook/README.md` para cambios de configuración.
- Documenta endpoints nuevos en `backend/openapi.yaml`.
- Registra decisiones de arquitectura relevantes creando un nuevo ADR en `docs/adr` (ver formato existente).

## Despliegues
- No hagas push directo a ramas protegidas.
- Verifica que el flujo de GitHub Actions concluye en verde antes de fusionar.
- Si se requieren cambios en infraestructura (Azure, Supabase), coordina con el equipo y documenta las modificaciones.

¡Gracias por ayudar a mejorar SpaceBook! Tu contribución es muy valiosa.
