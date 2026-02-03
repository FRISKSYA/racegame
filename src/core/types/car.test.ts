import { describe, it, expect } from 'vitest'
import {
  createCarState,
  updateCarState,
  getCarForward,
  getCarSpeed,
} from './car'
import { vec2, VEC2_ZERO } from './vector'

describe('CarState', () => {
  describe('createCarState', () => {
    it('creates car at given position', () => {
      const position = vec2(100, 200)
      const state = createCarState(position)
      expect(state.position).toEqual(position)
    })

    it('defaults rotation to 0', () => {
      const state = createCarState(vec2(0, 0))
      expect(state.rotation).toBe(0)
    })

    it('accepts custom rotation', () => {
      const state = createCarState(vec2(0, 0), Math.PI / 2)
      expect(state.rotation).toBe(Math.PI / 2)
    })

    it('initializes velocity to zero', () => {
      const state = createCarState(vec2(0, 0))
      expect(state.velocity).toEqual(VEC2_ZERO)
    })

    it('initializes angular velocity to zero', () => {
      const state = createCarState(vec2(0, 0))
      expect(state.angularVelocity).toBe(0)
    })
  })

  describe('updateCarState', () => {
    it('updates specified fields only', () => {
      const original = createCarState(vec2(100, 200), Math.PI)
      const newPosition = vec2(150, 250)
      const updated = updateCarState(original, { position: newPosition })

      expect(updated.position).toEqual(newPosition)
      expect(updated.rotation).toBe(original.rotation)
      expect(updated.velocity).toEqual(original.velocity)
    })

    it('returns new object (immutable)', () => {
      const original = createCarState(vec2(0, 0))
      const updated = updateCarState(original, { rotation: 1 })
      expect(updated).not.toBe(original)
    })

    it('does not modify original state', () => {
      const original = createCarState(vec2(100, 200))
      updateCarState(original, { position: vec2(0, 0) })
      expect(original.position).toEqual(vec2(100, 200))
    })
  })

  describe('getCarForward', () => {
    it('returns unit vector pointing right at rotation 0', () => {
      const state = createCarState(vec2(0, 0), 0)
      const forward = getCarForward(state)
      expect(forward.x).toBeCloseTo(1)
      expect(forward.y).toBeCloseTo(0)
    })

    it('returns unit vector pointing up at rotation PI/2', () => {
      const state = createCarState(vec2(0, 0), Math.PI / 2)
      const forward = getCarForward(state)
      expect(forward.x).toBeCloseTo(0)
      expect(forward.y).toBeCloseTo(1)
    })

    it('returns unit vector pointing left at rotation PI', () => {
      const state = createCarState(vec2(0, 0), Math.PI)
      const forward = getCarForward(state)
      expect(forward.x).toBeCloseTo(-1)
      expect(forward.y).toBeCloseTo(0)
    })
  })

  describe('getCarSpeed', () => {
    it('returns 0 for stationary car', () => {
      const state = createCarState(vec2(0, 0))
      expect(getCarSpeed(state)).toBe(0)
    })

    it('returns magnitude of velocity', () => {
      const state = updateCarState(createCarState(vec2(0, 0)), {
        velocity: vec2(3, 4),
      })
      expect(getCarSpeed(state)).toBe(5)
    })
  })
})
