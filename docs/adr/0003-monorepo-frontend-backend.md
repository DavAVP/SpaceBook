# 0003 - Mantener frontend y backend en un solo repositorio

- Estado: Aceptada
- Fecha: 2026-01-25

## Contexto
El equipo pequeño necesita coordinar releases de frontend (React/Vite) y backend (Express). Mantener repositorios separados complica la sincronización de versiones y pipelines estudiantiles.

## Decisión
Conservar un monorepo con la siguiente estructura:
- `spacebook/`: aplicación React + Vite.
- `backend/`: API Express para notificaciones.
- Workflows compartidos en `.github/` para integrar despliegues (Azure Static Web Apps, tests).

## Consecuencias
- Ventajas: Un solo repositorio para issues, PRs y CI/CD. Configuración compartida simplificada.
- Riesgos: Dependencias mezcladas y tiempos de instalación mayores en CI.
- Mitigaciones: Documentar comandos por carpeta, usar caches separadas en CI y definir rutas claras en la guía de contribución.
