/**
 * Car state representing the physical state of a car at a point in time.
 * Immutable - all updates create new state objects.
 */

import type { Vec2 } from './vector'
import { vec2, VEC2_ZERO } from './vector'

export interface CarState {
  /** Position in world coordinates (pixels) */
  readonly position: Vec2
  /** Rotation in radians (0 = facing right, increases counter-clockwise) */
  readonly rotation: number
  /** Velocity in pixels per second */
  readonly velocity: Vec2
  /** Angular velocity in radians per second (for future drift mechanics) */
  readonly angularVelocity: number
}

/** Create a car state at a starting position */
export function createCarState(
  position: Vec2,
  rotation = 0
): CarState {
  return {
    position,
    rotation,
    velocity: VEC2_ZERO,
    angularVelocity: 0,
  }
}

/** Create a new car state with updated values */
export function updateCarState(
  state: CarState,
  updates: Partial<CarState>
): CarState {
  return {
    position: updates.position ?? state.position,
    rotation: updates.rotation ?? state.rotation,
    velocity: updates.velocity ?? state.velocity,
    angularVelocity: updates.angularVelocity ?? state.angularVelocity,
  }
}

/** Get the forward direction vector of the car */
export function getCarForward(state: CarState): Vec2 {
  return vec2(Math.cos(state.rotation), Math.sin(state.rotation))
}

/** Get the current speed (magnitude of velocity) */
export function getCarSpeed(state: CarState): number {
  return Math.sqrt(
    state.velocity.x * state.velocity.x +
    state.velocity.y * state.velocity.y
  )
}
