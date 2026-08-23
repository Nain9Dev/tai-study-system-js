# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React# Sistema Oposiciones TAI - Frontend Híbrido

Este es el repositorio del frontend para el Sistema de Oposiciones TAI, refactorizado usando React 19, TypeScript, Vite, TanStack Router y Zustand.

## 🚀 Arquitectura de Conexión Híbrida

El sistema implementa un cliente API que soporta un modelo híbrido:

1. **Online (API-First)**: El frontend intenta conectarse a la API `.NET` especificada en las variables de entorno.
2. **Offline (Fallback)**: Si la API no responde, devuelve un error 500, o se produce un timeout, el sistema hace fallback automáticamente a los archivos JSON estáticos en `/public/data`. La interfaz indicará visualmente que se encuentra en Modo Offline.

### ⚙️ Configuración de Entorno

Para levantar la aplicación correctamente conectado al backend local, asegúrate de tener el archivo `.env` configurado:

```env
VITE_API_BASE_URL=http://localhost:5298/api
```

Para producción, utiliza el archivo `.env.production` (Vercel lo inyecta).

### 🛠️ Flujo de Comunicación (Zustand + React)

- Los componentes se suscriben a los custom hooks (`usePreguntas`, `useApi`).
- La capa `client.ts` centraliza las peticiones `fetch` nativas e inyecta los headers y el Auth Token.
- Los errores (ej. 401, 500) se lanzan como `ApiError` y los stores de Zustand los guardan en el estado `error` para que la UI muestre el aviso oportuno.
- Al guardar un **Intento**, si el sistema está offline, el historial se persiste exclusivamente en `localStorage` (`nain_tai_analytics_v1`).

### 📦 Desarrollo Local

1. Instalar dependencias: `npm install`
2. Levantar servidor frontend: `npm run dev`
3. Asegurarse de tener el backend corriendo: `dotnet run` (en la carpeta `Oposiciones.Api`).impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
