/**
 * Collision detection utilities.
 */

import type { Vec2 } from '../types/vector'
import type { LineSegment } from '../types/track'
import { subtract, cross, dot } from '../types/vector'

/**
 * Check if two line segments intersect.
 * Returns intersection point if they do, null otherwise.
 */
export function lineSegmentIntersection(
  seg1: LineSegment,
  seg2: LineSegment
): Vec2 | null {
  const p = seg1.start
  const r = subtract(seg1.end, seg1.start)
  const q = seg2.start
  const s = subtract(seg2.end, seg2.start)

  const rxs = cross(r, s)
  const qmp = subtract(q, p)
  const qmpxr = cross(qmp, r)

  // Parallel lines
  if (Math.abs(rxs) < 1e-10) {
    return null
  }

  const t = cross(qmp, s) / rxs
  const u = qmpxr / rxs

  // Check if intersection is within both segments
  if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
    return {
      x: p.x + t * r.x,
      y: p.y + t * r.y,
    }
  }

  return null
}

/**
 * Check if a point is inside a convex polygon.
 * Uses cross product method.
 */
export function pointInPolygon(point: Vec2, polygon: readonly Vec2[]): boolean {
  const n = polygon.length
  if (n < 3) return false

  let sign: number | null = null

  for (let i = 0; i < n; i++) {
    const a = polygon[i]!
    const b = polygon[(i + 1) % n]!
    const edge = subtract(b, a)
    const toPoint = subtract(point, a)
    const crossProduct = cross(edge, toPoint)

    if (sign === null) {
      sign = crossProduct > 0 ? 1 : -1
    } else if ((crossProduct > 0 ? 1 : -1) !== sign) {
      return false
    }
  }

  return true
}

/**
 * Get the corners of an axis-aligned bounding box rotated around center.
 */
export function getRotatedRectCorners(
  center: Vec2,
  width: number,
  height: number,
  rotation: number
): Vec2[] {
  const cos = Math.cos(rotation)
  const sin = Math.sin(rotation)
  const hw = width / 2
  const hh = height / 2

  // Local corners (relative to center)
  const localCorners = [
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
    { x: hw, y: hh },
    { x: -hw, y: hh },
  ]

  // Rotate and translate to world coordinates
  return localCorners.map((corner) => ({
    x: center.x + corner.x * cos - corner.y * sin,
    y: center.y + corner.x * sin + corner.y * cos,
  }))
}

/**
 * Check if a rotated rectangle intersects a line segment.
 */
export function rectangleIntersectsLine(
  center: Vec2,
  width: number,
  height: number,
  rotation: number,
  line: LineSegment
): boolean {
  const corners = getRotatedRectCorners(center, width, height, rotation)

  // Check if line intersects any edge of the rectangle
  for (let i = 0; i < 4; i++) {
    const edge: LineSegment = {
      start: corners[i]!,
      end: corners[(i + 1) % 4]!,
    }
    if (lineSegmentIntersection(edge, line)) {
      return true
    }
  }

  // Check if line is completely inside rectangle
  if (pointInPolygon(line.start, corners)) {
    return true
  }

  return false
}

/**
 * Find the closest point on a line segment to a given point.
 */
export function closestPointOnSegment(point: Vec2, segment: LineSegment): Vec2 {
  const v = subtract(segment.end, segment.start)
  const w = subtract(point, segment.start)

  const c1 = dot(w, v)
  if (c1 <= 0) return segment.start

  const c2 = dot(v, v)
  if (c2 <= c1) return segment.end

  const t = c1 / c2
  return {
    x: segment.start.x + t * v.x,
    y: segment.start.y + t * v.y,
  }
}
