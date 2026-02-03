/**
 * Renderer interface.
 * Allows different rendering implementations (Canvas 2D, WebGL, etc.)
 */

import type { GameState } from '../core/types/game'

/**
 * Renderer interface for drawing the game.
 */
export interface Renderer {
  /**
   * Render the current game state.
   * @param state The game state to render
   * @param alpha Interpolation factor (0-1) for smooth rendering between ticks
   */
  render(state: GameState, alpha: number): void

  /**
   * Resize the renderer to fit a new canvas size.
   */
  resize(width: number, height: number): void

  /**
   * Clean up resources.
   */
  destroy(): void
}
