/**
 * Core game state types.
 * GameState is the central data structure containing all game information.
 */

import type { CarState } from './car'
import type { Track } from './track'

/** Progress through checkpoints for lap tracking */
export interface LapProgress {
  /** Index of the last checkpoint passed */
  readonly lastCheckpointIndex: number
  /** Set of checkpoint indices passed in current lap */
  readonly checkpointsPassed: ReadonlySet<number>
}

/** Timing information for a single lap */
export interface LapTime {
  /** Lap number (1-indexed) */
  readonly lapNumber: number
  /** Time in milliseconds */
  readonly timeMs: number
}

/** Race timing state */
export interface TimingState {
  /** Timestamp when the race started (ms) */
  readonly raceStartTime: number
  /** Timestamp when current lap started (ms) */
  readonly lapStartTime: number
  /** Completed lap times */
  readonly lapTimes: readonly LapTime[]
  /** Current lap number (1-indexed) */
  readonly currentLap: number
}

/** Overall game status */
export type GameStatus = 'countdown' | 'racing' | 'finished'

/** Complete game state - pure data, no functions or DOM references */
export interface GameState {
  /** Current game status */
  readonly status: GameStatus
  /** Car state */
  readonly car: CarState
  /** Track definition */
  readonly track: Track
  /** Lap progress tracking */
  readonly lapProgress: LapProgress
  /** Timing information */
  readonly timing: TimingState
  /** Total laps required to finish */
  readonly totalLaps: number
  /** Current game tick number */
  readonly tick: number
}

/** Create initial lap progress */
export function createLapProgress(): LapProgress {
  return {
    lastCheckpointIndex: 0,
    checkpointsPassed: new Set([0]),
  }
}

/** Create initial timing state */
export function createTimingState(startTime: number): TimingState {
  return {
    raceStartTime: startTime,
    lapStartTime: startTime,
    lapTimes: [],
    currentLap: 1,
  }
}

/** Update game state immutably */
export function updateGameState(
  state: GameState,
  updates: Partial<GameState>
): GameState {
  return {
    status: updates.status ?? state.status,
    car: updates.car ?? state.car,
    track: updates.track ?? state.track,
    lapProgress: updates.lapProgress ?? state.lapProgress,
    timing: updates.timing ?? state.timing,
    totalLaps: updates.totalLaps ?? state.totalLaps,
    tick: updates.tick ?? state.tick,
  }
}
