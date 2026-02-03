import { describe, it, expect } from 'vitest'
import {
  lineSegmentIntersection,
  pointInPolygon,
  getRotatedRectCorners,
  rectangleIntersectsLine,
  closestPointOnSegment,
} from './collision'
import { vec2 } from '../types/vector'

describe('Collision', () => {
  describe('lineSegmentIntersection', () => {
    it('returns intersection point for crossing segments', () => {
      const seg1 = { start: vec2(0, 0), end: vec2(10, 10) }
      const seg2 = { start: vec2(0, 10), end: vec2(10, 0) }

      const result = lineSegmentIntersection(seg1, seg2)

      expect(result).not.toBeNull()
      expect(result!.x).toBeCloseTo(5)
      expect(result!.y).toBeCloseTo(5)
    })

    it('returns null for parallel segments', () => {
      const seg1 = { start: vec2(0, 0), end: vec2(10, 0) }
      const seg2 = { start: vec2(0, 5), end: vec2(10, 5) }

      const result = lineSegmentIntersection(seg1, seg2)

      expect(result).toBeNull()
    })

    it('returns null for non-intersecting segments', () => {
      const seg1 = { start: vec2(0, 0), end: vec2(5, 0) }
      const seg2 = { start: vec2(6, 1), end: vec2(10, 1) }

      const result = lineSegmentIntersection(seg1, seg2)

      expect(result).toBeNull()
    })

    it('detects intersection at endpoint', () => {
      const seg1 = { start: vec2(0, 0), end: vec2(5, 5) }
      const seg2 = { start: vec2(5, 5), end: vec2(10, 0) }

      const result = lineSegmentIntersection(seg1, seg2)

      expect(result).not.toBeNull()
      expect(result!.x).toBeCloseTo(5)
      expect(result!.y).toBeCloseTo(5)
    })
  })

  describe('pointInPolygon', () => {
    const square = [vec2(0, 0), vec2(10, 0), vec2(10, 10), vec2(0, 10)]

    it('returns true for point inside polygon', () => {
      expect(pointInPolygon(vec2(5, 5), square)).toBe(true)
    })

    it('returns false for point outside polygon', () => {
      expect(pointInPolygon(vec2(15, 5), square)).toBe(false)
    })

    it('returns false for insufficient vertices', () => {
      expect(pointInPolygon(vec2(5, 5), [vec2(0, 0), vec2(10, 0)])).toBe(false)
    })
  })

  describe('getRotatedRectCorners', () => {
    it('returns corners for unrotated rectangle', () => {
      const corners = getRotatedRectCorners(vec2(10, 10), 4, 2, 0)

      // Corners at x=8,12 and y=9,11
      expect(corners).toHaveLength(4)
      expect(corners[0]!.x).toBeCloseTo(8)
      expect(corners[0]!.y).toBeCloseTo(9)
    })

    it('returns rotated corners', () => {
      const corners = getRotatedRectCorners(vec2(0, 0), 4, 2, Math.PI / 2)

      // After 90 degree rotation, width and height swap
      expect(corners).toHaveLength(4)
    })
  })

  describe('rectangleIntersectsLine', () => {
    it('returns true when line crosses rectangle', () => {
      const result = rectangleIntersectsLine(
        vec2(10, 10),
        20,
        10,
        0,
        { start: vec2(0, 10), end: vec2(30, 10) }
      )

      expect(result).toBe(true)
    })

    it('returns false when line misses rectangle', () => {
      const result = rectangleIntersectsLine(
        vec2(10, 10),
        20,
        10,
        0,
        { start: vec2(0, 50), end: vec2(30, 50) }
      )

      expect(result).toBe(false)
    })

    it('returns true when line is inside rectangle', () => {
      const result = rectangleIntersectsLine(
        vec2(10, 10),
        20,
        10,
        0,
        { start: vec2(5, 10), end: vec2(15, 10) }
      )

      expect(result).toBe(true)
    })
  })

  describe('closestPointOnSegment', () => {
    it('returns start when closest point is before segment', () => {
      const segment = { start: vec2(0, 0), end: vec2(10, 0) }
      const result = closestPointOnSegment(vec2(-5, 5), segment)

      expect(result.x).toBeCloseTo(0)
      expect(result.y).toBeCloseTo(0)
    })

    it('returns end when closest point is after segment', () => {
      const segment = { start: vec2(0, 0), end: vec2(10, 0) }
      const result = closestPointOnSegment(vec2(15, 5), segment)

      expect(result.x).toBeCloseTo(10)
      expect(result.y).toBeCloseTo(0)
    })

    it('returns point on segment when perpendicular', () => {
      const segment = { start: vec2(0, 0), end: vec2(10, 0) }
      const result = closestPointOnSegment(vec2(5, 5), segment)

      expect(result.x).toBeCloseTo(5)
      expect(result.y).toBeCloseTo(0)
    })
  })
})
