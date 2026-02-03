/**
 * Game state factory and management functions.
 */

import type { GameState } from '../types/game'
import type { Track } from '../types/track'
import { createCarState } from '../types/car'
import { createLapProgress, createTimingState } from '../types/game'
import { GAME_CONFIG } from '../../config'

/**
 * Create initial game state for a track.
 */
export function createInitialGameState(track: Track): GameState {
  const now = performance.now()

  return {
    status: 'countdown',
    car: createCarState(track.startPosition, track.startRotation),
    track,
    lapProgress: createLapProgress(),
    timing: createTimingState(now),
    totalLaps: GAME_CONFIG.TOTAL_LAPS,
    tick: 0,
  }
}

/**
 * Reset game state for restart.
 */
export function resetGameState(state: GameState): GameState {
  const now = performance.now()

  return {
    status: 'countdown',
    car: createCarState(state.track.startPosition, state.track.startRotation),
    track: state.track,
    lapProgress: createLapProgress(),
    timing: createTimingState(now),
    totalLaps: state.totalLaps,
    tick: 0,
  }
}
