/**
 * Simple physics engine implementation.
 * No slip/drift - car always moves in the direction it's facing.
 */

import type { PhysicsEngine, PhysicsConfig } from './physics-engine'
import type { CarState } from '../types/car'
import type { InputCommand } from '../types/input'
import { updateCarState, getCarSpeed } from '../types/car'
import { scale, add, fromAngle, dot } from '../types/vector'
import { GAME_CONFIG } from '../../config'

/**
 * Pure function: Calculate speed change from throttle input.
 */
function calculateThrottleEffect(
  currentSpeed: number,
  throttle: number,
  deltaTime: number,
  acceleration: number
): number {
  if (throttle <= 0) {
    return currentSpeed
  }
  return currentSpeed + acceleration * throttle * deltaTime
}

/**
 * Pure function: Calculate speed change from brake input.
 */
function calculateBrakeEffect(
  currentSpeed: number,
  brake: number,
  deltaTime: number,
  brakeAcceleration: number,
  minSteeringSpeed: number
): number {
  if (brake <= 0) {
    return currentSpeed
  }

  const brakeForce = brakeAcceleration * brake * deltaTime

  if (currentSpeed > minSteeringSpeed) {
    // Braking when moving forward
    return Math.max(0, currentSpeed - brakeForce)
  }

  if (currentSpeed < -minSteeringSpeed) {
    // Braking when moving backward (accelerate forward)
    return Math.min(0, currentSpeed + brakeForce)
  }

  // Reverse acceleration when nearly stopped
  const reverseForce = brakeAcceleration * brake * deltaTime * 0.5
  return currentSpeed - reverseForce
}

/**
 * Pure function: Calculate speed change from friction (natural deceleration).
 */
function calculateFrictionEffect(
  currentSpeed: number,
  throttle: number,
  brake: number,
  deltaTime: number,
  friction: number
): number {
  if (throttle !== 0 || brake !== 0) {
    return currentSpeed
  }

  const frictionForce = friction * deltaTime

  if (Math.abs(currentSpeed) < frictionForce) {
    return 0
  }

  return currentSpeed > 0
    ? currentSpeed - frictionForce
    : currentSpeed + frictionForce
}

/**
 * Pure function: Clamp speed to valid range.
 */
function clampSpeed(speed: number, maxSpeed: number, maxReverseSpeed: number): number {
  return Math.max(-maxReverseSpeed, Math.min(maxSpeed, speed))
}

/** Create default physics configuration from game config */
export function createDefaultPhysicsConfig(): PhysicsConfig {
  return {
    maxSpeed: GAME_CONFIG.CAR.MAX_SPEED,
    maxReverseSpeed: GAME_CONFIG.CAR.MAX_REVERSE_SPEED,
    acceleration: GAME_CONFIG.CAR.ACCELERATION,
    brakeAcceleration: GAME_CONFIG.CAR.BRAKE_ACCELERATION,
    friction: GAME_CONFIG.CAR.FRICTION,
    steeringRate: GAME_CONFIG.CAR.STEERING_RATE,
    minSteeringSpeed: GAME_CONFIG.CAR.MIN_STEERING_SPEED,
  }
}

/**
 * Simple physics engine with no slip.
 * Car velocity is always aligned with car direction.
 */
export class SimplePhysicsEngine implements PhysicsEngine {
  constructor(private readonly config: PhysicsConfig = createDefaultPhysicsConfig()) {}

  update(car: CarState, input: InputCommand, deltaTime: number): CarState {
    const forward = fromAngle(car.rotation)
    const currentSpeed = this.getSignedSpeed(car, forward)

    // Calculate new rotation (only when moving)
    const newRotation = this.updateRotation(
      car.rotation,
      currentSpeed,
      input.steering,
      deltaTime
    )

    // Calculate new speed
    const newSpeed = this.updateSpeed(
      currentSpeed,
      input.throttle,
      input.brake,
      deltaTime
    )

    // Calculate new velocity (always aligned with direction)
    const newForward = fromAngle(newRotation)
    const newVelocity = scale(newForward, newSpeed)

    // Calculate new position
    const newPosition = add(car.position, scale(newVelocity, deltaTime))

    return updateCarState(car, {
      position: newPosition,
      rotation: newRotation,
      velocity: newVelocity,
    })
  }

  /**
   * Get signed speed (positive = forward, negative = reverse)
   */
  private getSignedSpeed(car: CarState, forward: ReturnType<typeof fromAngle>): number {
    const speed = getCarSpeed(car)
    if (speed < 0.001) return 0

    // Determine direction based on velocity alignment with forward vector
    const alignment = dot(car.velocity, forward)
    return alignment >= 0 ? speed : -speed
  }

  /**
   * Update rotation based on steering input and current speed.
   */
  private updateRotation(
    rotation: number,
    speed: number,
    steering: number,
    deltaTime: number
  ): number {
    // No steering when nearly stationary
    if (Math.abs(speed) < this.config.minSteeringSpeed) {
      return rotation
    }

    // Steering effectiveness scales with speed (but inversely at high speed for stability)
    const speedFactor = Math.min(1, Math.abs(speed) / (this.config.maxSpeed * 0.5))
    const steeringAmount = steering * this.config.steeringRate * speedFactor * deltaTime

    // Reverse steering direction when going backwards
    const direction = speed >= 0 ? 1 : -1

    return rotation + steeringAmount * direction
  }

  /**
   * Update speed based on throttle, brake, and friction.
   * Uses pure function composition for immutability.
   */
  private updateSpeed(
    currentSpeed: number,
    throttle: number,
    brake: number,
    deltaTime: number
  ): number {
    const afterThrottle = calculateThrottleEffect(
      currentSpeed,
      throttle,
      deltaTime,
      this.config.acceleration
    )

    const afterBrake = calculateBrakeEffect(
      afterThrottle,
      brake,
      deltaTime,
      this.config.brakeAcceleration,
      this.config.minSteeringSpeed
    )

    const afterFriction = calculateFrictionEffect(
      afterBrake,
      throttle,
      brake,
      deltaTime,
      this.config.friction
    )

    return clampSpeed(
      afterFriction,
      this.config.maxSpeed,
      this.config.maxReverseSpeed
    )
  }
}
