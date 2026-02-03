import { describe, it, expect } from 'vitest'
import { SimplePhysicsEngine } from './simple-physics'
import type { PhysicsConfig } from './physics-engine'
import { createCarState, getCarSpeed } from '../types/car'
import { INPUT_NONE, createInputCommand } from '../types/input'
import { vec2 } from '../types/vector'

const testConfig: PhysicsConfig = {
  maxSpeed: 100,
  maxReverseSpeed: 50,
  acceleration: 50,
  brakeAcceleration: 100,
  friction: 10,
  steeringRate: 2,
  minSteeringSpeed: 5,
}

describe('SimplePhysicsEngine', () => {
  const engine = new SimplePhysicsEngine(testConfig)
  const dt = 1 / 60

  describe('stationary car', () => {
    it('stays stationary with no input', () => {
      const car = createCarState(vec2(100, 100), 0)
      const newCar = engine.update(car, INPUT_NONE, dt)

      expect(newCar.position.x).toBeCloseTo(100)
      expect(newCar.position.y).toBeCloseTo(100)
      expect(getCarSpeed(newCar)).toBeCloseTo(0)
    })

    it('does not rotate when stationary', () => {
      const car = createCarState(vec2(100, 100), Math.PI / 4)
      const input = createInputCommand(0, 0, 1) // full right steering
      const newCar = engine.update(car, input, dt)

      expect(newCar.rotation).toBeCloseTo(Math.PI / 4)
    })
  })

  describe('acceleration', () => {
    it('accelerates forward with throttle', () => {
      const car = createCarState(vec2(100, 100), 0)
      const input = createInputCommand(1, 0, 0) // full throttle

      let updatedCar = car
      for (let i = 0; i < 10; i++) {
        updatedCar = engine.update(updatedCar, input, dt)
      }

      expect(getCarSpeed(updatedCar)).toBeGreaterThan(0)
      expect(updatedCar.position.x).toBeGreaterThan(100)
    })

    it('respects max speed limit', () => {
      const car = createCarState(vec2(100, 100), 0)
      const input = createInputCommand(1, 0, 0) // full throttle

      let updatedCar = car
      for (let i = 0; i < 1000; i++) {
        updatedCar = engine.update(updatedCar, input, dt)
      }

      expect(getCarSpeed(updatedCar)).toBeLessThanOrEqual(testConfig.maxSpeed + 0.1)
    })

    it('partial throttle accelerates slower', () => {
      const carFull = createCarState(vec2(100, 100), 0)
      const carHalf = createCarState(vec2(100, 100), 0)

      const fullThrottle = createInputCommand(1, 0, 0)
      const halfThrottle = createInputCommand(0.5, 0, 0)

      let fullCar = carFull
      let halfCar = carHalf

      for (let i = 0; i < 10; i++) {
        fullCar = engine.update(fullCar, fullThrottle, dt)
        halfCar = engine.update(halfCar, halfThrottle, dt)
      }

      expect(getCarSpeed(fullCar)).toBeGreaterThan(getCarSpeed(halfCar))
    })
  })

  describe('braking', () => {
    it('decelerates with brake when moving forward', () => {
      // Start with a moving car
      let car = createCarState(vec2(100, 100), 0)
      const throttle = createInputCommand(1, 0, 0)

      // Accelerate first
      for (let i = 0; i < 30; i++) {
        car = engine.update(car, throttle, dt)
      }
      const speedBeforeBrake = getCarSpeed(car)

      // Now brake
      const brake = createInputCommand(0, 1, 0)
      for (let i = 0; i < 10; i++) {
        car = engine.update(car, brake, dt)
      }

      expect(getCarSpeed(car)).toBeLessThan(speedBeforeBrake)
    })

    it('can reverse from standstill', () => {
      const car = createCarState(vec2(100, 100), 0) // facing right
      const input = createInputCommand(0, 1, 0) // brake = reverse

      let updatedCar = car
      for (let i = 0; i < 30; i++) {
        updatedCar = engine.update(updatedCar, input, dt)
      }

      // Should be moving left (negative x direction)
      expect(updatedCar.position.x).toBeLessThan(100)
    })

    it('respects max reverse speed', () => {
      const car = createCarState(vec2(100, 100), 0)
      const input = createInputCommand(0, 1, 0) // full reverse

      let updatedCar = car
      for (let i = 0; i < 1000; i++) {
        updatedCar = engine.update(updatedCar, input, dt)
      }

      expect(getCarSpeed(updatedCar)).toBeLessThanOrEqual(testConfig.maxReverseSpeed + 0.1)
    })
  })

  describe('friction', () => {
    it('car slows down due to friction when no input', () => {
      // Start with a moving car
      let car = createCarState(vec2(100, 100), 0)
      const throttle = createInputCommand(1, 0, 0)

      for (let i = 0; i < 30; i++) {
        car = engine.update(car, throttle, dt)
      }
      const speedBeforeFriction = getCarSpeed(car)

      // Release all inputs
      for (let i = 0; i < 30; i++) {
        car = engine.update(car, INPUT_NONE, dt)
      }

      expect(getCarSpeed(car)).toBeLessThan(speedBeforeFriction)
    })

    it('car eventually stops due to friction', () => {
      // Start with a moving car
      let car = createCarState(vec2(100, 100), 0)
      const throttle = createInputCommand(1, 0, 0)

      for (let i = 0; i < 30; i++) {
        car = engine.update(car, throttle, dt)
      }

      // Let friction stop the car
      for (let i = 0; i < 1000; i++) {
        car = engine.update(car, INPUT_NONE, dt)
      }

      expect(getCarSpeed(car)).toBeCloseTo(0)
    })
  })

  describe('steering', () => {
    it('turns right with positive steering', () => {
      let car = createCarState(vec2(100, 100), 0)
      const input = createInputCommand(1, 0, 1) // throttle + right steering

      for (let i = 0; i < 30; i++) {
        car = engine.update(car, input, dt)
      }

      expect(car.rotation).toBeGreaterThan(0)
    })

    it('turns left with negative steering', () => {
      let car = createCarState(vec2(100, 100), 0)
      const input = createInputCommand(1, 0, -1) // throttle + left steering

      for (let i = 0; i < 30; i++) {
        car = engine.update(car, input, dt)
      }

      expect(car.rotation).toBeLessThan(0)
    })

    it('steering reverses when going backwards', () => {
      let car = createCarState(vec2(100, 100), 0)

      // Reverse
      const reverse = createInputCommand(0, 1, 0)
      for (let i = 0; i < 30; i++) {
        car = engine.update(car, reverse, dt)
      }

      const rotationBeforeSteer = car.rotation

      // Steer right while reversing
      const steerRight = createInputCommand(0, 1, 1)
      for (let i = 0; i < 30; i++) {
        car = engine.update(car, steerRight, dt)
      }

      // When reversing, right steering should turn left (negative)
      expect(car.rotation).toBeLessThan(rotationBeforeSteer)
    })
  })

  describe('movement direction', () => {
    it('moves in facing direction when facing right', () => {
      let car = createCarState(vec2(100, 100), 0) // facing right
      const input = createInputCommand(1, 0, 0)

      for (let i = 0; i < 30; i++) {
        car = engine.update(car, input, dt)
      }

      expect(car.position.x).toBeGreaterThan(100)
      expect(car.position.y).toBeCloseTo(100)
    })

    it('moves in facing direction when facing up', () => {
      let car = createCarState(vec2(100, 100), Math.PI / 2) // facing up
      const input = createInputCommand(1, 0, 0)

      for (let i = 0; i < 30; i++) {
        car = engine.update(car, input, dt)
      }

      expect(car.position.x).toBeCloseTo(100)
      expect(car.position.y).toBeGreaterThan(100)
    })

    it('moves in facing direction when facing diagonal', () => {
      let car = createCarState(vec2(100, 100), Math.PI / 4) // facing 45 degrees
      const input = createInputCommand(1, 0, 0)

      for (let i = 0; i < 30; i++) {
        car = engine.update(car, input, dt)
      }

      expect(car.position.x).toBeGreaterThan(100)
      expect(car.position.y).toBeGreaterThan(100)
    })
  })

  describe('determinism', () => {
    it('produces identical results for same input sequence', () => {
      const runSimulation = (): { x: number; y: number; rotation: number } => {
        let car = createCarState(vec2(100, 100), 0)
        const inputs = [
          createInputCommand(1, 0, 0),
          createInputCommand(1, 0, 0.5),
          createInputCommand(0.5, 0, 0.5),
          createInputCommand(0, 1, 0),
          createInputCommand(1, 0, -0.5),
        ]

        for (const input of inputs) {
          for (let i = 0; i < 60; i++) {
            car = engine.update(car, input, dt)
          }
        }

        return {
          x: car.position.x,
          y: car.position.y,
          rotation: car.rotation,
        }
      }

      const result1 = runSimulation()
      const result2 = runSimulation()

      expect(result1.x).toBeCloseTo(result2.x)
      expect(result1.y).toBeCloseTo(result2.y)
      expect(result1.rotation).toBeCloseTo(result2.rotation)
    })
  })
})
