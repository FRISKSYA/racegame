/**
 * Input source interface.
 * Allows different input methods (keyboard, network, AI) to be used interchangeably.
 */

import type { InputCommand } from '../types/input'

/**
 * Interface for input sources.
 * Implementations can read from keyboard, network, AI, etc.
 */
export interface InputSource {
  /**
   * Get the current input state.
   * Called once per game tick.
   */
  getInput(): InputCommand

  /**
   * Start listening for inputs.
   */
  start(): void

  /**
   * Stop listening for inputs.
   */
  stop(): void
}
