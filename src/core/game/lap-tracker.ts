/**
 * Lap tracking and checkpoint management.
 */

import type { Vec2 } from '../types/vector'
import type { Checkpoint } from '../types/track'
import type { LapProgress, TimingState, LapTime } from '../types/game'
import { lineSegmentIntersection } from './collision'

/**
 * Check if a movement from oldPos to newPos crosses a checkpoint.
 */
export function crossesCheckpoint(
  oldPos: Vec2,
  newPos: Vec2,
  checkpoint: Checkpoint
): boolean {
  const movement = { start: oldPos, end: newPos }
  return lineSegmentIntersection(movement, checkpoint.segment) !== null
}

/**
 * Update result from lap progress update
 */
export interface LapUpdateResult {
  lapProgress: LapProgress
  timing: TimingState
  raceFinished: boolean
}

/**
 * Update lap progress after car movement.
 */
export function updateLapProgress(
  progress: LapProgress,
  timing: TimingState,
  checkpoints: readonly Checkpoint[],
  oldPos: Vec2,
  newPos: Vec2,
  totalLaps: number
): LapUpdateResult {
  let newProgress = progress
  let newTiming = timing
  let raceFinished = false

  // Check each checkpoint
  for (const checkpoint of checkpoints) {
    if (crossesCheckpoint(oldPos, newPos, checkpoint)) {
      const result = processCheckpointCross(
        newProgress,
        newTiming,
        checkpoint,
        checkpoints.length,
        totalLaps
      )
      newProgress = result.progress
      newTiming = result.timing
      raceFinished = result.raceFinished
    }
  }

  return {
    lapProgress: newProgress,
    timing: newTiming,
    raceFinished,
  }
}

/**
 * Process a checkpoint crossing.
 */
function processCheckpointCross(
  progress: LapProgress,
  timing: TimingState,
  checkpoint: Checkpoint,
  totalCheckpoints: number,
  totalLaps: number
): { progress: LapProgress; timing: TimingState; raceFinished: boolean } {
  const checkpointIndex = checkpoint.index
  let raceFinished = false

  // Special handling for start/finish line (checkpoint 0)
  if (checkpointIndex === 0) {
    // Check if all other checkpoints have been passed (lap completion)
    const allOthersPassed = Array.from(
      { length: totalCheckpoints - 1 },
      (_, i) => i + 1
    ).every((i) => progress.checkpointsPassed.has(i))

    if (allOthersPassed) {
      // Complete the lap
      const now = performance.now()
      const lapTime: LapTime = {
        lapNumber: timing.currentLap,
        timeMs: now - timing.lapStartTime,
      }

      const newLapTimes = [...timing.lapTimes, lapTime]

      // Check if race finished
      if (timing.currentLap >= totalLaps) {
        raceFinished = true
      }

      return {
        progress: {
          lastCheckpointIndex: 0,
          checkpointsPassed: new Set([0]),
        },
        timing: {
          ...timing,
          lapTimes: newLapTimes,
          lapStartTime: now,
          currentLap: timing.currentLap + 1,
        },
        raceFinished,
      }
    }

    // Not completing a lap - ignore crossing start/finish again
    return { progress, timing, raceFinished }
  }

  // For non-start/finish checkpoints: check if already passed
  if (progress.checkpointsPassed.has(checkpointIndex)) {
    return { progress, timing, raceFinished }
  }

  // Check if this is the next expected checkpoint (prevent shortcuts)
  const expectedNext = (progress.lastCheckpointIndex + 1) % totalCheckpoints
  if (checkpointIndex !== expectedNext) {
    return { progress, timing, raceFinished }
  }

  // Update progress for non-start/finish checkpoint
  const newCheckpointsPassed = new Set(progress.checkpointsPassed)
  newCheckpointsPassed.add(checkpointIndex)

  return {
    progress: {
      lastCheckpointIndex: checkpointIndex,
      checkpointsPassed: newCheckpointsPassed,
    },
    timing,
    raceFinished,
  }
}

/**
 * Get best lap time from completed laps.
 */
export function getBestLapTime(timing: TimingState): LapTime | null {
  if (timing.lapTimes.length === 0) return null

  return timing.lapTimes.reduce((best, current) =>
    current.timeMs < best.timeMs ? current : best
  )
}

/**
 * Get current lap time in milliseconds.
 */
export function getCurrentLapTime(timing: TimingState): number {
  return performance.now() - timing.lapStartTime
}

/**
 * Get total race time in milliseconds.
 */
export function getTotalRaceTime(timing: TimingState): number {
  return performance.now() - timing.raceStartTime
}

/**
 * Format time in milliseconds to mm:ss.mmm
 */
export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.floor((ms % 60000) / 1000)
  const millis = Math.floor(ms % 1000)

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`
}
