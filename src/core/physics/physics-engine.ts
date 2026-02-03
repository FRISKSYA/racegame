/**
 * Physics engine interface.
 * Allows swapping physics implementations without changing game logic.
 */

import type { CarState } from '../types/car'
import type { InputCommand } from '../types/input'

/** Physics engine configuration */
export interface PhysicsConfig {
  /** Maximum forward speed in pixels per second */
  readonly maxSpeed: number
  /** Maximum reverse speed in pixels per second */
  readonly maxReverseSpeed: number
  /** Acceleration rate in pixels per second squared */
  readonly acceleration: number
  /** Braking acceleration rate */
  readonly brakeAcceleration: number
  /** Natural friction deceleration */
  readonly friction: number
  /** Steering rate in radians per second */
  readonly steeringRate: number
  /** Minimum speed required for steering */
  readonly minSteeringSpeed: number
}

/**
 * Physics engine interface.
 * Updates car state based on input and physics rules.
 */
export interface PhysicsEngine {
  /**
   * Update car state for one physics tick.
   * @param car Current car state
   * @param input Input command for this tick
   * @param deltaTime Time step in seconds
   * @returns New car state after physics update
   */
  update(car: CarState, input: InputCommand, deltaTime: number): CarState
}
