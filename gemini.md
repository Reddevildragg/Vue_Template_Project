# Project Context: React + Vite + Tailwind CSS 4

## Tech Stack
- **Framework**: React 19 (Functional Components with Hooks)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4 (using `@tailwindcss/vite` plugin)
- **State Management**: Redux Toolkit (RTK)
- **Routing**: React Router DOM
- **Language**: TypeScript (Strict mode)
- **Linting/Formatting**: ESLint 9 (Flat Config), Prettier, Stylelint
- **Type Checking**: tsc

## Project Structure
- `src/components/`: Reusable UI components.
- `src/components/base/`: Atomic/Base components (e.g., `BaseIcon.tsx`, `BaseButton.tsx`).
- `src/views/`: Page-level components used by React Router.
- `src/hooks/`: Custom React hooks for shared stateful logic.
- `src/stores/`: Redux Toolkit store definitions and slices.
- `src/router/`: Route definitions.
- `src/types/`: Global TypeScript interfaces and types.
- `src/utils/`: Pure helper functions (formatters, validators, loggers).
- `src/assets/`: Static assets and global CSS (including `main.css`).
- `@/`: Alias for the `src` directory.

## Coding Standards

### React Components
- **Structure**: Always use functional components and hooks.
- **State**: Prefer `useState` or `useReducer` for local state. Use Redux for global state.
- **Props**: Define clear interface for props. Use `children` prop for layout wrappers.
- **Accessibility (a11y)**:
    - Use **Semantic HTML** tags (e.g., `<nav>`, `<main>`, `<article>`, `<button>`).
    - Ensure all interactive elements have visible `focus-visible` states.
    - Provide `aria-label` or `aria-labelledby` for icon-only buttons.
- **Iconography**:
    - **Default**: Use [Lucide React](https://lucide.dev/guide/packages/lucide-react).
    - **SVG Strategy**: Use neutral/white SVGs as base. Colorize them using Tailwind CSS text-color classes (e.g., `text-primary`).
    - **Custom SVGs**: Ensure custom SVGs use `stroke="currentColor"` or `fill="currentColor"` to allow CSS color injection.
- **Utility First**: Leverage Tailwind utility classes. Avoid creating custom CSS modules unless strictly necessary for third-party overrides.

### TypeScript
- Use strict typing. Avoid `any`.
- Prefer `interface` for object shapes and `type` for unions/aliases.
- Type functional components implicitly by inferring the return type from JSX.

### Clean Code & Documentation
- **Self-Documenting Code**: Prioritize highly descriptive variable and function names (e.g., `isUserAuthenticated` instead of `auth`). The intent should be clear from the name alone.
- **Mandatory Function Comments**: Every function, custom hook, and complex logic block must include a brief JSDoc comment.
    - **Standard**: Comments should be an *addition* to self-documenting code, explaining the "why" or providing a quick summary, not just restating the function name.
- **Concise Logic**: Avoid "death by comments." Keep inline comments extremely brief and only use them when logic is non-obvious.
- **Unit Testing**: Tests (Vitest/Jest) are only to be generated upon explicit request.

### State Management (Redux Toolkit)
- **Slice Syntax**: Use `createSlice` for all Redux logic.
- **Modular Architecture**: Break logic into small, domain-specific slices (e.g., `authSlice`, `userSlice`, `uiSlice`).
- **Hooks**: Always use the typed custom hooks `useAppDispatch` and `useAppSelector` from `src/hooks/store.ts`.
- **Async Logic**: Use `createAsyncThunk` for asynchronous side effects in Redux.

### Styling (Tailwind CSS 4)
- **CSS-First Configuration**: All theme configuration is handled in `src/assets/main.css` via the `@theme` block.
- **Color Variable Hierarchy**:
    1. **Logical/Brand Colors**: Define specific brand identity colors (e.g., `--color-brand-green: #2ecc71;`).
    2. **Semantic/Generic Colors**: Define functional variables (e.g., `--color-primary`, `--color-surface`, `--color-text-main`) that reference the brand variables via `var()`.
- **Semantic-First Approach**: Always use generic/semantic variables for the majority of the application. Brand-specific variables should only be used for fixed identity elements.
- **Responsive Design**: Follow a **Mobile-First** approach using Tailwind responsive prefixes (`sm:`, `md:`, `lg:`).
- **Micro-animations**:
    - Incorporate subtle transitions (hover scales, gentle fades) to make the UI feel fresh and modern.
    - **A11y**: Use `motion-safe:` variants and respect `prefers-reduced-motion`.
- **Organization via Layers**: Wrap global CSS in `@layer components` or `@layer utilities`.

### Error Handling & Logging
- **Resilient Processes**: Wrap asynchronous requests and high-risk logic in `try-catch` blocks.
- **Logging**: Use `console.error` or a dedicated logging utility for developer debugging.
- **User Feedback**: Never allow a silent failure. Always provide UI feedback (Toasts, error banners, or skeleton states) to inform the user of progress or issues.

## Task Management & Documentation
- **Checklist Format**: `[ ]` for pending, `[X]` for completed.
- **Completion Summaries**: Provide a concise summary of the specific actions performed after marking a task as complete.

## Common Commands
- Development: `npm run dev`
- Build: `npm run build`
- Type Check: `npm run type-check`
- Linting: `npm run lint`

## Specific Instructions for Gemini
- **Naming & JSDoc**: Use intent-revealing names and include a one-line JSDoc header for all functions (e.g., `/** Fetches user profile and updates local state */`).
- **No Automatic Tests**: Do not generate test files unless specifically asked.
- **Robust Error Handling**: Always include `try-catch` blocks with console logging and a UI feedback strategy (e.g., loading states) for async logic.
- **Mobile-First**: Generate responsive layouts by default.
- **Incorporate Motion**: Suggest or implement subtle micro-animations (e.g., `hover:scale-105 transition-all`) for interactive elements.
- **Domain-Specific Slices**: If a request involves new state, suggest a **new specific Redux slice** rather than bloating an existing one.
- **Logic Extraction**: If logic in a component exceeds 50 lines, suggest moving it to a `src/hooks/` custom hook or a `src/utils/` file.
- **Route Setup**: When adding routes, use the configuration object structure in `src/router/index.tsx`.
- **Semantic Colors**: Prioritize generic semantic utility classes (e.g., `text-primary`, `bg-background`) over brand-specific ones.
