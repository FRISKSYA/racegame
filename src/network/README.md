# Network Module

This directory is reserved for future multiplayer functionality.

## Planned Features

- WebSocket-based real-time communication
- Client-server state synchronization
- Input prediction and reconciliation
- Lag compensation

## Architecture Notes

The game is designed with multiplayer in mind:

- `GameState` is pure data (no functions or DOM references) - can run on server
- `GameLoop.step(input)` advances one tick - enables server-authoritative model
- `InputSource` interface allows network input injection
