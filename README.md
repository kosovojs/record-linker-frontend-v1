# Record Linker Frontend - Project Context

This document provides essential context for developers (human or AI) continuing work on this project.

## Quick Start

```bash
# Prerequisites: Node.js 20+, pnpm
pnpm install
pnpm dev
```

## Project Status

**Current Phase**: Ready to begin Phase 1 (Project Scaffolding)

The implementation plan has been created and approved. See [docs/implementation_plan.md](./docs/implementation_plan.md) for the full technical plan.

## Key Documents

| Document | Purpose |
|----------|---------|
| [docs/implementation_plan.md](./docs/implementation_plan.md) | Technical plan with architecture, phases, and verification |
| [QUESTIONS.md](./QUESTIONS.md) | Design decisions with user answers |

## Technology Stack

- **Build**: Vite + React 19 + TypeScript (strict mode)
- **Package Manager**: **pnpm** (not npm/yarn)
- **Routing**: TanStack Router
- **State**: Redux Toolkit + React Query
- **UI**: shadcn/ui + Tailwind CSS
- **Validation**: Zod (API schemas)
- **Testing**: Vitest + React Testing Library

## Architecture Summary

- **Feature-first** organization (vertical slices)
- **Service Layer** pattern: Redux slices hold *state*, services hold *logic*
- **Zod validation** for all API responses
- **React Query** for server state, **Redux** for client state

## API Backend

- Backend runs at `http://localhost:8000`
- Vite proxy configured to forward `/api` → backend
- API specification: [input/api-specification.md](./input/api-specification.md)

## Commands

```bash
# Development
pnpm dev              # Start dev server (http://localhost:5173)

# Quality checks
pnpm typecheck        # tsc --noEmit
pnpm lint             # ESLint
pnpm test             # Vitest
pnpm test:coverage    # Vitest with coverage

# Build
pnpm build            # Production build
```

## Implementation Phases

1. ✅ Implementation plan created
2. ✅ Phase 1: Project scaffolding (COMPLETE)
3. ✅ Phase 2: Core infrastructure (COMPLETE)
4. ⬜ Phase 3: Dataset management
5. ⬜ Phase 4: Project management
6. ⬜ Phase 5: Reconciliation Workspace (Addrify-style)
7. ⬜ Phase 6: Automatches view (Mix'n'Match-style)
8. ⬜ Phase 7: Polish & export

## Notes for AI Assistants

1. **Prefer `docs/implementation_plan.md`** over the `input/` folder
2. The `input/` folder contains reference materials used during planning—avoid reading unless specifically needed
3. Use **pnpm**, not npm or yarn
4. Follow the Service Layer pattern described in the implementation plan
5. Keep components small and testable
