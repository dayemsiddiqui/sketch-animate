# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React Router v7 application with server-side rendering (SSR) enabled. It uses Vite as the build tool and Tailwind CSS v4 for styling.

## Development Commands

```bash
# Start development server with HMR at http://localhost:5173
npm run dev

# Type checking (generates React Router types first, then runs tsc)
npm run typecheck

# Production build
npm run build

# Start production server (after build)
npm start

# Docker deployment
docker build -t my-app .
docker run -p 3000:3000 my-app
```

## Architecture

### Routing System
- Routes are defined in `app/routes.ts` using React Router v7's file-based routing configuration
- Route files live in `app/routes/` directory
- Type-safe route definitions using `RouteConfig` from `@react-router/dev/routes`
- Auto-generated types are placed in `.react-router/types/` directory

### Application Structure
- `app/root.tsx`: Root layout component with `Layout`, `App`, and `ErrorBoundary` exports
  - `Layout`: Wraps the entire app with `<html>` and `<body>`, includes Meta, Links, Scripts
  - `App`: Main app component that renders the `<Outlet />` for route content
  - `ErrorBoundary`: Global error handler with dev-mode stack traces
- `app/routes/home.tsx`: Index route that renders the Welcome component
- `app/welcome/`: Reusable Welcome component with SVG assets
- `app/app.css`: Global styles with Tailwind imports and theme configuration

### Type-Safe Routes
- Routes use generated types from `./+types/[route-name]` for type safety
- Available type exports: `Route.MetaArgs`, `Route.LinksFunction`, `Route.ErrorBoundaryProps`
- Path aliases configured: `~/*` maps to `./app/*`

### Styling
- Tailwind CSS v4 with Vite plugin (`@tailwindcss/vite`)
- Theme customization in `app/app.css` using `@theme` directive
- Dark mode support via `prefers-color-scheme`
- Custom font: Inter (loaded from Google Fonts in root.tsx)

### SSR Configuration
- SSR is enabled by default in `react-router.config.ts`
- Server entry point: `build/server/index.js` (after build)
- Client assets: `build/client/` (after build)

### Build Output
After running `npm run build`, the structure is:
```
build/
├── client/    # Static assets for browser
└── server/    # Server-side code (index.js entry point)
```

## Key Dependencies
- `react-router@^7.9.2`: Full-stack routing framework with SSR
- `@react-router/node`, `@react-router/serve`: Server runtime
- `tailwindcss@^4.1.13`: Utility-first CSS framework
- `vite@^7.1.7`: Build tool and dev server
- `typescript@^5.9.2`: Type checking (strict mode enabled)

## Important Notes
- Always run `npm run typecheck` before committing to catch TypeScript errors
- React Router auto-generates types - run typecheck to regenerate them
- The app uses React 19 and strict TypeScript configuration
- `vite-tsconfig-paths` enables path aliases from tsconfig.json
