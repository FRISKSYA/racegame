import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  crossesCheckpoint,
  updateLapProgress,
  getBestLapTime,
  formatTime,
} from './lap-tracker'
import type { LapProgress, TimingState } from '../types/game'
import type { Checkpoint } from '../types/track'
import { vec2 } from '../types/vector'
import { createLineSegment, createCheckpoint } from '../types/track'

describe('LapTracker', () => {
  // Mock performance.now for deterministic tests
  let mockNow = 0
  beforeEach(() => {
    mockNow = 0
    vi.spyOn(performance, 'now').mockImplementation(() => mockNow)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('crossesCheckpoint', () => {
    const checkpoint: Checkpoint = createCheckpoint(
      createLineSegment(vec2(0, 0), vec2(0, 10)),
      0
    )

    it('returns true when movement crosses checkpoint', () => {
      const result = crossesCheckpoint(vec2(-5, 5), vec2(5, 5), checkpoint)
      expect(result).toBe(true)
    })

    it('returns false when movement does not cross checkpoint', () => {
      const result = crossesCheckpoint(vec2(-5, 5), vec2(-2, 5), checkpoint)
      expect(result).toBe(false)
    })

    it('returns false when moving parallel to checkpoint', () => {
      const result = crossesCheckpoint(vec2(-5, 0), vec2(-5, 10), checkpoint)
      expect(result).toBe(false)
    })
  })

  describe('updateLapProgress', () => {
    const checkpoints: Checkpoint[] = [
      createCheckpoint(createLineSegment(vec2(0, 0), vec2(0, 100)), 0), // Start/finish
      createCheckpoint(createLineSegment(vec2(100, 0), vec2(100, 100)), 1),
      createCheckpoint(createLineSegment(vec2(200, 0), vec2(200, 100)), 2),
    ]

    const initialProgress: LapProgress = {
      lastCheckpointIndex: 0,
      checkpointsPassed: new Set([0]),
    }

    const initialTiming: TimingState = {
      raceStartTime: 0,
      lapStartTime: 0,
      lapTimes: [],
      currentLap: 1,
    }

    it('updates progress when crossing next checkpoint in sequence', () => {
      const result = updateLapProgress(
        initialProgress,
        initialTiming,
        checkpoints,
        vec2(90, 50),
        vec2(110, 50),
        3
      )

      expect(result.lapProgress.lastCheckpointIndex).toBe(1)
      expect(result.lapProgress.checkpointsPassed.has(1)).toBe(true)
    })

    it('ignores checkpoint if crossed out of order', () => {
      const result = updateLapProgress(
        initialProgress,
        initialTiming,
        checkpoints,
        vec2(190, 50),
        vec2(210, 50), // Trying to cross checkpoint 2 before 1
        3
      )

      expect(result.lapProgress.lastCheckpointIndex).toBe(0)
      expect(result.lapProgress.checkpointsPassed.has(2)).toBe(false)
    })

    it('completes lap when crossing start/finish after all checkpoints', () => {
      mockNow = 1000

      const progressAllPassed: LapProgress = {
        lastCheckpointIndex: 2,
        checkpointsPassed: new Set([0, 1, 2]),
      }

      const result = updateLapProgress(
        progressAllPassed,
        initialTiming,
        checkpoints,
        vec2(-10, 50),
        vec2(10, 50),
        3
      )

      expect(result.timing.currentLap).toBe(2)
      expect(result.timing.lapTimes).toHaveLength(1)
      expect(result.timing.lapTimes[0]!.lapNumber).toBe(1)
      expect(result.timing.lapTimes[0]!.timeMs).toBe(1000)
    })

    it('signals race finished on final lap completion', () => {
      mockNow = 5000

      const progressAllPassed: LapProgress = {
        lastCheckpointIndex: 2,
        checkpointsPassed: new Set([0, 1, 2]),
      }

      const timingLastLap: TimingState = {
        raceStartTime: 0,
        lapStartTime: 4000,
        lapTimes: [
          { lapNumber: 1, timeMs: 2000 },
          { lapNumber: 2, timeMs: 2000 },
        ],
        currentLap: 3,
      }

      const result = updateLapProgress(
        progressAllPassed,
        timingLastLap,
        checkpoints,
        vec2(-10, 50),
        vec2(10, 50),
        3
      )

      expect(result.raceFinished).toBe(true)
    })
  })

  describe('getBestLapTime', () => {
    it('returns null when no lap times', () => {
      const timing: TimingState = {
        raceStartTime: 0,
        lapStartTime: 0,
        lapTimes: [],
        currentLap: 1,
      }

      expect(getBestLapTime(timing)).toBeNull()
    })

    it('returns fastest lap time', () => {
      const timing: TimingState = {
        raceStartTime: 0,
        lapStartTime: 0,
        lapTimes: [
          { lapNumber: 1, timeMs: 3000 },
          { lapNumber: 2, timeMs: 2500 },
          { lapNumber: 3, timeMs: 2800 },
        ],
        currentLap: 4,
      }

      const best = getBestLapTime(timing)
      expect(best).not.toBeNull()
      expect(best!.lapNumber).toBe(2)
      expect(best!.timeMs).toBe(2500)
    })
  })

  describe('formatTime', () => {
    it('formats time correctly', () => {
      expect(formatTime(0)).toBe('00:00.000')
      expect(formatTime(1000)).toBe('00:01.000')
      expect(formatTime(61500)).toBe('01:01.500')
      expect(formatTime(125750)).toBe('02:05.750')
    })
  })
})
