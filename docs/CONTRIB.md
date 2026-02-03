# Contributing Guide

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server
make dev
# or: npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `make dev` | Start Vite dev server with HMR |
| `make build` | TypeScript compile + production build |
| `make test` | Run Vitest in watch mode |
| `make coverage` | Run tests with coverage report |
| `make lint` | ESLint check on src/ |
| `make typecheck` | TypeScript type check (no emit) |
| `make clean` | Remove dist/, coverage/, cache |

## Testing

```bash
# Watch mode
make test

# Single run with coverage
make coverage
```

Coverage threshold: 80% (statements, branches, functions, lines)

## Code Style

- **Immutability**: Always create new objects, never mutate
- **File size**: 200-400 lines typical, 800 max
- **Functions**: < 50 lines
- **Types**: Use `readonly` for all state properties

## Project Structure

```
src/
├── config.ts              # Game constants
├── main.ts                # Entry point
├── core/
│   ├── types/             # Vec2, CarState, GameState
│   ├── physics/           # PhysicsEngine interface + impl
│   ├── input/             # InputSource interface + impl
│   ├── game/              # GameLoop, collision, lap tracking
│   └── track/             # Track loader
└── renderer/              # Canvas renderer, camera
```

## Commit Convention

```
<type>: <description>

Types: feat, fix, refactor, docs, test, chore
```
