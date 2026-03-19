# Project Context: Vue 3 + Vite + Tailwind CSS 4

## Tech Stack
- **Framework**: Vue 3 (Composition API with `<script setup>`)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4 (using `@tailwindcss/vite` plugin)
- **State Management**: Pinia
- **Routing**: Vue Router
- **Language**: TypeScript (Strict mode)
- **Linting/Formatting**: ESLint 9 (Flat Config), Prettier, Stylelint
- **Type Checking**: vue-tsc

## Project Structure
- `src/components/`: Reusable UI components.
- `src/views/`: Page-level components used by Vue Router.
- `src/stores/`: Pinia store definitions.
- `src/router/`: Route definitions.
- `src/assets/`: Static assets and global CSS.
- `@/`: Alias for the `src` directory.

## Coding Standards

### Vue Components
- **Block Order**: Always use the following structure:
    1. `<template>`
    2. `<script setup lang="ts">`
    3. `<style>` (only if necessary)
- Use `<script setup lang="ts">`.
- Prefer functional components or the Composition API over the Options API.
- Use PascalCase for component filenames (e.g., `MyComponent.vue`).
- Define props using `defineProps<{ ... }>()` and emits using `defineEmits<{ ... }>()`.
- Leverage Tailwind utility classes. Avoid `<style scoped>` unless necessary for complex animations or third-party overrides.

### TypeScript
- Use strict typing. Avoid `any`.
- Prefer `interface` for object shapes and `type` for unions/aliases.
- Use path aliases (e.g., `import { MyStore } from '@/stores/myStore'`).

### State Management (Pinia)
- Use the "Setup Store" syntax (functions) instead of "Option Stores".
- Keep logic related to data fetching and manipulation inside the store.

### Styling
- This project uses **Tailwind CSS 4** with the `@tailwindcss/vite` plugin.
- **Organization via Layers**: Organize custom CSS using Tailwind's layer system to ensure proper cascade order:
    - Use `@layer components` for reusable component-level styles (e.g., `.btn-primary`).
    - Use `@layer utilities` or the `@utility` directive for custom single-purpose helper classes.
- **Priority on Design Tokens**: Always prioritize Tailwind's default design tokens (e.g., `pt-4`, `m-2`, `w-1/2`) over arbitrary values (e.g., `pt-[10px]`, `m-[0.5rem]`).
- **Arbitrary Values**: Only use `-[...]` notation as a last resort for specific, one-off values that cannot be achieved with the default scale.
- **Custom Theme Variables**: If a recurring custom value is needed, define it as a CSS variable within the `@theme` block in `src/assets/main.css` rather than using inline arbitrary values.
- **Utility First**: Prefer utility classes in templates.
- **Custom Classes**: If a custom class is absolutely necessary, define it in a `<style>` block using Tailwind's `@apply` directive to maintain theme consistency.
- **Animations**: Use the `tailwindcss-animate` plugin for animations. Do not write custom `@keyframes` if the plugin provides an equivalent (e.g., `animate-in`, `fade-in`, `zoom-in`).
- **Scrollbars**: Use Tailwind's scrollbar utility classes (if configured) or standard Tailwind spacing/color utilities rather than writing raw `::-webkit-scrollbar` CSS.
- **Theme Variables**: Reference theme colors and spacing via Tailwind's `@theme` or CSS variables instead of hardcoded hex codes.

## Task Management & Documentation
- **Checklist Format**: When planning or proposing improvements, use the following markdown checkbox format:
    - `[ ]` for pending tasks.
    - `[X]` for completed tasks.
- **Completion Summaries**: Once a task is marked as `[X]`, provide a concise summary of the specific actions performed (e.g., "Updated `App.vue` to use the new `Header` component and fixed alignment issues").
- **Consistency**: Maintain these checklists across different prompts to track long-term progress.

## Common Commands
- Development: `npm run dev`
- Build: `npm run build`
- Type Check: `npm run type-check`
- Linting: `npm run lint`
- Style Linting: `npm run lint:styles`

## Specific Instructions for Gemini
- When generating components, always follow the **template -> script -> style** block order.
- Always include the `<script setup lang="ts">` block.
- **Communication Style**: Do not mention or repeat code from context attachments unless it is strictly necessary for the explanation or implementation.
- **Layer Organization**: When suggesting global CSS changes, wrap them in the appropriate `@layer components` or `@layer utilities` blocks in `src/assets/main.css`.
- **Avoid Arbitrary Values**: Use standard Tailwind spacing, sizing, and color scales. If a custom value is needed repeatedly, suggest adding it to the `@theme` block in `src/assets/main.css`.
- **Avoid Raw CSS**: When styling, prioritize Tailwind utility classes or `@apply`.
- **Use Plugins**: Favor `tailwindcss-animate` for any motion or transitions requested.
- Follow the existing folder structure.
- Ensure all types are properly defined and exported if needed.
- If creating a new view, remind the user to register it in `src/router/index.ts`.