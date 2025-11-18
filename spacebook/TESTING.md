# Guía de Testing para SpaceBook

Esta guía te ayudará a entender cómo funcionan los tests en este proyecto y cómo escribir nuevos tests.

## Configuración

El proyecto usa:
- **Vitest**: Framework de testing rápido y moderno
- **React Testing Library**: Para testear componentes de React
- **@testing-library/user-event**: Para simular interacciones del usuario

## Ejecutar Tests

```bash
# Ejecutar todos los tests una vez
npm run test -- --run

# Ejecutar tests en modo watch (se actualizan automáticamente)
npm run test

# Ejecutar tests con cobertura
npm run test -- --coverage
```

## Estructura de Tests

Los archivos de test deben:
- Estar en la misma carpeta que el componente
- Tener el nombre del componente seguido de `.test.tsx` o `.test.ts`
- Ejemplo: `login.tsx` → `login.test.tsx`

## Ejemplos de Tests Creados

### 1. Test de Login (`src/pages/login.test.tsx`)

Este test cubre:
- ✅ Validación de campos vacíos
- ✅ Manejo de credenciales inválidas
- ✅ Redirección según el rol (admin/cliente)

**Conceptos importantes:**
- Uso de `vi.hoisted()` para mocks que se usan antes de que se carguen los módulos
- Mock de `react-router-dom` para simular navegación
- Mock de servicios para aislar el componente

### 2. Test de Register (`src/pages/register.test.tsx`)

Este test cubre:
- ✅ Validación de formulario
- ✅ Manejo de errores de registro
- ✅ Mensajes de éxito

### 3. Test de Navbar (`src/components/navbar.test.tsx`)

Este test cubre:
- ✅ Renderizado condicional según autenticación
- ✅ Badges de rol (admin/cliente)
- ✅ Navegación y logout

**Conceptos importantes:**
- Mock de Supabase para simular autenticación
- Test de interacciones del usuario (clicks, menús)

### 4. Test de Home (`src/pages/clients/home.test.tsx`)

Este test cubre:
- ✅ Estados de carga
- ✅ Renderizado de lista de espacios
- ✅ Filtrado de espacios disponibles
- ✅ Manejo de errores

**Conceptos importantes:**
- Mock de servicios de datos
- Test de estados asíncronos con `waitFor`

## Cómo Escribir un Nuevo Test

### Paso 1: Importar dependencias

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MiComponente from './MiComponente';
```

### Paso 2: Crear mocks necesarios

```typescript
const { mockFuncion } = vi.hoisted(() => ({
  mockFuncion: vi.fn(),
}));

vi.mock('../ruta/al/servicio', () => ({
  Servicio: {
    metodo: mockFuncion,
  },
}));
```

### Paso 3: Escribir tests

```typescript
describe('MiComponente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería renderizar correctamente', () => {
    render(<MiComponente />);
    expect(screen.getByText('Texto esperado')).toBeInTheDocument();
  });

  it('debería manejar interacciones del usuario', async () => {
    render(<MiComponente />);
    
    const boton = screen.getByRole('button', { name: /click me/i });
    await userEvent.click(boton);
    
    await waitFor(() => {
      expect(screen.getByText('Resultado')).toBeInTheDocument();
    });
  });
});
```

## Consejos y Mejores Prácticas

1. **Aislar componentes**: Usa mocks para servicios externos y dependencias
2. **Testear comportamiento, no implementación**: Enfócate en lo que el usuario ve y hace
3. **Usar queries accesibles**: Prefiere `getByRole`, `getByLabelText` sobre `getByTestId`
4. **Esperar estados asíncronos**: Usa `waitFor` para cambios que ocurren después de async operations
5. **Limpiar mocks**: Usa `beforeEach` para resetear mocks entre tests

## Queries Recomendadas (por prioridad)

1. `getByRole` - Más accesible y semántico
2. `getByLabelText` - Para formularios
3. `getByText` - Para contenido visible
4. `getByPlaceholderText` - Para inputs sin label
5. `getByTestId` - Último recurso, solo si es necesario

## Recursos Adicionales

- [Documentación de Vitest](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Queries](https://testing-library.com/docs/queries/about/)

## Notas sobre el Código Actual

⚠️ **Componente Register**: El componente `register.tsx` tiene un bug - no usa `await` al llamar a `AuthService.HandleSingUp`. Esto hace que el test sea más complejo. Se recomienda corregir el componente para usar `await`.

```typescript
// ❌ Actual (línea 33)
const usuario = AuthService.HandleSingUp(email, password);

// ✅ Debería ser
const usuario = await AuthService.HandleSingUp(email, password);
```

