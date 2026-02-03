import { describe, it, expect } from 'vitest'
import {
  vec2,
  VEC2_ZERO,
  add,
  subtract,
  scale,
  length,
  lengthSquared,
  normalize,
  dot,
  cross,
  rotate,
  perpendicular,
  lerp,
  distance,
  distanceSquared,
  fromAngle,
  toAngle,
  clampLength,
  equals,
} from './vector'

describe('Vec2', () => {
  describe('vec2', () => {
    it('creates a vector with given coordinates', () => {
      const v = vec2(3, 4)
      expect(v.x).toBe(3)
      expect(v.y).toBe(4)
    })
  })

  describe('VEC2_ZERO', () => {
    it('is the zero vector', () => {
      expect(VEC2_ZERO.x).toBe(0)
      expect(VEC2_ZERO.y).toBe(0)
    })
  })

  describe('add', () => {
    it('adds two vectors', () => {
      const result = add(vec2(1, 2), vec2(3, 4))
      expect(result.x).toBe(4)
      expect(result.y).toBe(6)
    })

    it('returns new vector (immutable)', () => {
      const a = vec2(1, 2)
      const b = vec2(3, 4)
      const result = add(a, b)
      expect(result).not.toBe(a)
      expect(result).not.toBe(b)
    })
  })

  describe('subtract', () => {
    it('subtracts second vector from first', () => {
      const result = subtract(vec2(5, 7), vec2(2, 3))
      expect(result.x).toBe(3)
      expect(result.y).toBe(4)
    })
  })

  describe('scale', () => {
    it('multiplies vector by scalar', () => {
      const result = scale(vec2(2, 3), 4)
      expect(result.x).toBe(8)
      expect(result.y).toBe(12)
    })

    it('handles negative scalars', () => {
      const result = scale(vec2(2, 3), -2)
      expect(result.x).toBe(-4)
      expect(result.y).toBe(-6)
    })
  })

  describe('length', () => {
    it('calculates magnitude of vector', () => {
      expect(length(vec2(3, 4))).toBe(5)
    })

    it('returns 0 for zero vector', () => {
      expect(length(VEC2_ZERO)).toBe(0)
    })
  })

  describe('lengthSquared', () => {
    it('calculates squared magnitude', () => {
      expect(lengthSquared(vec2(3, 4))).toBe(25)
    })
  })

  describe('normalize', () => {
    it('returns unit vector in same direction', () => {
      const result = normalize(vec2(3, 4))
      expect(result.x).toBeCloseTo(0.6)
      expect(result.y).toBeCloseTo(0.8)
      expect(length(result)).toBeCloseTo(1)
    })

    it('returns zero vector for zero input', () => {
      const result = normalize(VEC2_ZERO)
      expect(result.x).toBe(0)
      expect(result.y).toBe(0)
    })
  })

  describe('dot', () => {
    it('calculates dot product', () => {
      expect(dot(vec2(1, 2), vec2(3, 4))).toBe(11)
    })

    it('returns 0 for perpendicular vectors', () => {
      expect(dot(vec2(1, 0), vec2(0, 1))).toBe(0)
    })
  })

  describe('cross', () => {
    it('calculates 2D cross product (z-component)', () => {
      expect(cross(vec2(1, 0), vec2(0, 1))).toBe(1)
      expect(cross(vec2(0, 1), vec2(1, 0))).toBe(-1)
    })
  })

  describe('rotate', () => {
    it('rotates vector by 90 degrees', () => {
      const result = rotate(vec2(1, 0), Math.PI / 2)
      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(1)
    })

    it('rotates vector by 180 degrees', () => {
      const result = rotate(vec2(1, 0), Math.PI)
      expect(result.x).toBeCloseTo(-1)
      expect(result.y).toBeCloseTo(0)
    })

    it('full rotation returns to original', () => {
      const original = vec2(3, 4)
      const result = rotate(original, Math.PI * 2)
      expect(result.x).toBeCloseTo(original.x)
      expect(result.y).toBeCloseTo(original.y)
    })
  })

  describe('perpendicular', () => {
    it('returns perpendicular vector', () => {
      const result = perpendicular(vec2(1, 0))
      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(1)
    })

    it('perpendicular is 90 degrees counter-clockwise', () => {
      const v = vec2(3, 4)
      const perp = perpendicular(v)
      expect(dot(v, perp)).toBeCloseTo(0)
    })
  })

  describe('lerp', () => {
    it('interpolates between vectors', () => {
      const result = lerp(vec2(0, 0), vec2(10, 20), 0.5)
      expect(result.x).toBe(5)
      expect(result.y).toBe(10)
    })

    it('returns first vector at t=0', () => {
      const a = vec2(1, 2)
      const result = lerp(a, vec2(10, 20), 0)
      expect(result.x).toBe(a.x)
      expect(result.y).toBe(a.y)
    })

    it('returns second vector at t=1', () => {
      const b = vec2(10, 20)
      const result = lerp(vec2(1, 2), b, 1)
      expect(result.x).toBe(b.x)
      expect(result.y).toBe(b.y)
    })
  })

  describe('distance', () => {
    it('calculates distance between points', () => {
      expect(distance(vec2(0, 0), vec2(3, 4))).toBe(5)
    })
  })

  describe('distanceSquared', () => {
    it('calculates squared distance', () => {
      expect(distanceSquared(vec2(0, 0), vec2(3, 4))).toBe(25)
    })
  })

  describe('fromAngle', () => {
    it('creates unit vector pointing right at angle 0', () => {
      const result = fromAngle(0)
      expect(result.x).toBeCloseTo(1)
      expect(result.y).toBeCloseTo(0)
    })

    it('creates unit vector pointing up at angle PI/2', () => {
      const result = fromAngle(Math.PI / 2)
      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(1)
    })
  })

  describe('toAngle', () => {
    it('returns angle of vector', () => {
      expect(toAngle(vec2(1, 0))).toBeCloseTo(0)
      expect(toAngle(vec2(0, 1))).toBeCloseTo(Math.PI / 2)
      expect(toAngle(vec2(-1, 0))).toBeCloseTo(Math.PI)
    })
  })

  describe('clampLength', () => {
    it('returns same vector if under max length', () => {
      const v = vec2(3, 4) // length = 5
      const result = clampLength(v, 10)
      expect(result).toBe(v)
    })

    it('clamps to max length if exceeded', () => {
      const result = clampLength(vec2(6, 8), 5) // length = 10, clamped to 5
      expect(length(result)).toBeCloseTo(5)
      expect(result.x).toBeCloseTo(3)
      expect(result.y).toBeCloseTo(4)
    })
  })

  describe('equals', () => {
    it('returns true for identical vectors', () => {
      expect(equals(vec2(1, 2), vec2(1, 2))).toBe(true)
    })

    it('returns false for different vectors', () => {
      expect(equals(vec2(1, 2), vec2(1, 3))).toBe(false)
    })

    it('uses epsilon for floating point comparison', () => {
      expect(equals(vec2(1, 2), vec2(1.0000000001, 2), 1e-9)).toBe(true)
    })
  })
})
