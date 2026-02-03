/**
 * Game entry point.
 * Initializes all systems and starts the game loop.
 */

import { GAME_CONFIG } from './config'
import { createInitialGameState } from './core/game/game-state'
import { GameLoop } from './core/game/game-loop'
import { KeyboardInput } from './core/input/keyboard-input'
import { CanvasRenderer } from './renderer/canvas-renderer'
import { createOvalTrack } from './core/track/track-loader'

function main(): void {
  try {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
    if (!canvas) {
      throw new Error('Canvas element not found')
    }

    canvas.width = GAME_CONFIG.CANVAS_WIDTH
    canvas.height = GAME_CONFIG.CANVAS_HEIGHT

    const track = createOvalTrack()
    const initialState = createInitialGameState(track)
    const inputSource = new KeyboardInput()
    const renderer = new CanvasRenderer(canvas)
    const gameLoop = new GameLoop(initialState, inputSource, renderer)

    // Set up restart callback
    inputSource.setOnRestart(() => gameLoop.restart())

    gameLoop.start()
  } catch (error) {
    console.error('Game initialization failed:', error)
    document.body.innerHTML = `
      <div style="color: #fff; padding: 20px; font-family: monospace; background: #1a1a2e; min-height: 100vh;">
        <h1>Failed to start game</h1>
        <p>Please ensure your browser supports Canvas 2D rendering.</p>
        <pre style="color: #ff4444;">${error instanceof Error ? error.message : 'Unknown error'}</pre>
      </div>
    `
  }
}

document.addEventListener('DOMContentLoaded', main)
