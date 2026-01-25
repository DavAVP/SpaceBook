# 0001 - Usar Supabase para autenticación y datos básicos

- Estado: Aceptada
- Fecha: 2026-01-25

## Contexto
Necesitamos un backend gestionado para autenticación, almacenamiento de perfiles y datos básicos de reservas sin construir infraestructura personalizada. El equipo cuenta con presupuesto limitado y busca integraciones sencillas con frontend React.

## Decisión
Adoptar Supabase como Backend-as-a-Service para:
- Autenticación de usuarios (correo + magic link y sesiones persistentes).
- Almacenamiento de perfiles (`profiles`), penalizaciones y tablas de apoyo.
- Gestión de roles `cliente` y `admin` vinculados al perfil.

## Consecuencias
- Ventajas: SDK listo para React, base de datos Postgres administrada, soporte a Realtime y políticas RLS.
- Riesgos: Dependencia de un servicio externo y costos ligados al plan. Se requiere cuidar las políticas RLS para evitar filtraciones.
- Mitigaciones: Documentar migrations y mantener backups periódicos vía Supabase.
