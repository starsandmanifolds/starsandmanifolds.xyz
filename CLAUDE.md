# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

starsandmanifolds.xyz is a personal portfolio and blog website for a software developer, built with SvelteKit and TypeScript, deployed to Cloudflare Pages. The site features a modern, minimalistic design with full dark mode support.

## Tech Stack

- **Framework**: SvelteKit v2 with TypeScript
- **Styling**: Tailwind CSS with custom theme configuration
- **Build Tool**: Vite
- **Deployment**: Cloudflare Pages/Workers via @sveltejs/adapter-cloudflare
- **Type Checking**: svelte-check with strict TypeScript

## Essential Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:5173)

# Building
npm run build        # Build production version
npm run preview      # Preview production build locally

# Type Checking
npm run check        # Run type checking once
npm run check:watch  # Run type checking in watch mode
```

## Project Structure

```
src/
├── routes/                    # File-based routing
│   ├── +layout.svelte        # Root layout (imports global CSS)
│   ├── +page.svelte          # Home page
│   └── privacy-policy/       # Privacy policy route
├── lib/
│   ├── components/           # Reusable Svelte components
│   ├── constants.ts          # Application constants and content
│   ├── privacy-policy-content.ts
│   └── types.ts              # TypeScript type definitions
├── app.html                  # HTML template
└── app.css                   # Global CSS with Tailwind directives
```

## Architecture Patterns

### Data Flow
Unidirectional data flow: `constants.ts → Routes → Components (via props)`

### Component Guidelines
- Components are purely presentational (no internal state)
- All props must be explicitly typed using interfaces from `types.ts`
- Use `<script lang="ts">` for TypeScript in all components
- Style exclusively with Tailwind CSS utility classes

### Routing
- File-based routing following SvelteKit conventions
- Each page manages its own Header/Footer imports
- No shared layout navigation

## Custom Theme

The project uses a modern color system with dark mode support:
- **Primary colors**: Blue scale (`primary-50` to `primary-950`)
- **Neutral colors**: Gray scale (`neutral-50` to `neutral-950`)
- **Fonts**: Inter (primary), JetBrains Mono (code)
- **Dark mode**: Implemented with Tailwind's `dark:` classes and localStorage persistence

## Important Notes

- **No testing framework** is configured
- **No linting tools** (ESLint/Prettier) are set up
- **Static site only** - no API routes or server-side functionality
- **No environment variables** are used
- Font loading optimized in `app.html` using async pattern
- Dark mode toggle component with system preference detection

## Development Guidelines

1. Maintain the established data flow pattern
2. Keep components purely presentational
3. Update content in `constants.ts` rather than in components
4. Ensure all new code follows TypeScript strict mode
5. Test responsiveness across mobile and desktop viewports
6. Optimize images before adding to static folder