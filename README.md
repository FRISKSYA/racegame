# Race Game

見下ろし型レースゲーム - TypeScript + Canvas 2D

## Play

```bash
npm install
make dev
# Open http://localhost:5173
```

**Controls**: WASD / Arrow keys | **Restart**: R

## Features

- 3周タイムアタック
- 固定タイムステップ物理 (60 tick/sec)
- チェックポイント周回管理
- ラップタイム記録 & ベストラップ表示

## Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite |
| Language | TypeScript (strict) |
| Rendering | Canvas 2D |
| Validation | Zod |
| Testing | Vitest (80%+ coverage) |

## Architecture

```
src/
├── core/           # Renderer-independent game logic
│   ├── types/      # Vec2, CarState, GameState (immutable)
│   ├── physics/    # PhysicsEngine interface
│   ├── input/      # InputSource interface
│   ├── game/       # GameLoop, collision, lap tracking
│   └── track/      # Track loader (Zod validated)
└── renderer/       # Canvas 2D implementation
```

**Extensibility**:
- `GameState`: Pure data → server-executable
- `GameLoop.step(input)`: External control for AI
- Interfaces: Swappable physics/input/renderer

## Scripts

```bash
make dev        # Dev server
make build      # Production build
make test       # Run tests
make coverage   # Coverage report
make typecheck  # Type check
```

## License

MIT
