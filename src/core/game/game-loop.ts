/**
 * Fixed timestep game loop.
 * Provides deterministic updates regardless of frame rate.
 */

import type { GameState } from '../types/game'
import type { InputCommand } from '../types/input'
import type { InputSource } from '../input/input-source'
import type { PhysicsEngine } from '../physics/physics-engine'
import type { Renderer } from '../../renderer/renderer'
import { updateGameState } from '../types/game'
import { SimplePhysicsEngine } from '../physics/simple-physics'
import { GAME_CONFIG } from '../../config'
import { updateLapProgress } from './lap-tracker'

/** Callback for state changes */
export type StateChangeCallback = (state: GameState) => void

/**
 * Fixed timestep game loop.
 * - Physics updates at fixed rate (60 tick/sec by default)
 * - Rendering uses frame interpolation for smoothness
 */
export class GameLoop {
  private state: GameState
  private readonly inputSource: InputSource
  private readonly renderer: Renderer
  private readonly physics: PhysicsEngine

  private running = false
  private animationFrameId: number | null = null
  private accumulator = 0
  private lastTime = 0

  private readonly tickDuration: number
  private onStateChange: StateChangeCallback | null = null

  constructor(
    initialState: GameState,
    inputSource: InputSource,
    renderer: Renderer,
    physics?: PhysicsEngine
  ) {
    this.state = initialState
    this.inputSource = inputSource
    this.renderer = renderer
    this.physics = physics ?? new SimplePhysicsEngine()
    this.tickDuration = GAME_CONFIG.TICK_DURATION
  }

  /**
   * Start the game loop.
   */
  start(): void {
    if (this.running) return

    this.running = true
    this.inputSource.start()
    this.lastTime = performance.now()
    this.accumulator = 0

    // Start racing immediately (skip countdown for MVP)
    this.state = updateGameState(this.state, {
      status: 'racing',
      timing: {
        ...this.state.timing,
        raceStartTime: performance.now(),
        lapStartTime: performance.now(),
      },
    })

    this.loop()
  }

  /**
   * Stop the game loop.
   */
  stop(): void {
    this.running = false
    this.inputSource.stop()

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  /**
   * Set callback for state changes.
   */
  setOnStateChange(callback: StateChangeCallback): void {
    this.onStateChange = callback
  }

  /**
   * Get current game state.
   */
  getState(): GameState {
    return this.state
  }

  /**
   * Execute a single physics step with given input.
   * Useful for AI API and testing.
   */
  step(input: InputCommand): GameState {
    if (this.state.status !== 'racing') {
      return this.state
    }

    // Update physics
    const newCar = this.physics.update(this.state.car, input, this.tickDuration)

    // Update lap progress
    const { lapProgress, timing, raceFinished } = updateLapProgress(
      this.state.lapProgress,
      this.state.timing,
      this.state.track.checkpoints,
      this.state.car.position,
      newCar.position,
      this.state.totalLaps
    )

    this.state = updateGameState(this.state, {
      car: newCar,
      lapProgress,
      timing,
      tick: this.state.tick + 1,
      status: raceFinished ? 'finished' : 'racing',
    })

    this.onStateChange?.(this.state)

    return this.state
  }

  /**
   * Restart the game.
   */
  restart(): void {
    this.stop()

    const now = performance.now()
    this.state = updateGameState(this.state, {
      status: 'racing',
      car: {
        position: this.state.track.startPosition,
        rotation: this.state.track.startRotation,
        velocity: { x: 0, y: 0 },
        angularVelocity: 0,
      },
      lapProgress: {
        lastCheckpointIndex: 0,
        checkpointsPassed: new Set([0]),
      },
      timing: {
        raceStartTime: now,
        lapStartTime: now,
        lapTimes: [],
        currentLap: 1,
      },
      tick: 0,
    })

    this.start()
  }

  private loop(): void {
    if (!this.running) return

    const currentTime = performance.now()
    const frameTime = Math.min((currentTime - this.lastTime) / 1000, 0.25) // Cap to prevent spiral of death
    this.lastTime = currentTime

    this.accumulator += frameTime

    // Fixed timestep updates
    while (this.accumulator >= this.tickDuration) {
      const input = this.inputSource.getInput()
      this.step(input)
      this.accumulator -= this.tickDuration
    }

    // Calculate interpolation factor for smooth rendering
    const alpha = this.accumulator / this.tickDuration

    // Render
    this.renderer.render(this.state, alpha)

    this.animationFrameId = requestAnimationFrame(() => this.loop())
  }
}
