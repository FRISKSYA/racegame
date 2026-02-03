/**
 * 2D Vector type with immutable operations.
 * All operations return new Vec2 instances.
 */

export interface Vec2 {
  readonly x: number
  readonly y: number
}

/** Create a new Vec2 */
export function vec2(x: number, y: number): Vec2 {
  return { x, y }
}

/** Zero vector */
export const VEC2_ZERO: Vec2 = vec2(0, 0)

/** Add two vectors */
export function add(a: Vec2, b: Vec2): Vec2 {
  return vec2(a.x + b.x, a.y + b.y)
}

/** Subtract vector b from vector a */
export function subtract(a: Vec2, b: Vec2): Vec2 {
  return vec2(a.x - b.x, a.y - b.y)
}

/** Multiply vector by scalar */
export function scale(v: Vec2, scalar: number): Vec2 {
  return vec2(v.x * scalar, v.y * scalar)
}

/** Get the length (magnitude) of a vector */
export function length(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

/** Get the squared length (avoids sqrt for performance) */
export function lengthSquared(v: Vec2): number {
  return v.x * v.x + v.y * v.y
}

/** Normalize vector to unit length. Returns zero vector if input is zero. */
export function normalize(v: Vec2): Vec2 {
  const len = length(v)
  if (len === 0) {
    return VEC2_ZERO
  }
  return vec2(v.x / len, v.y / len)
}

/** Dot product of two vectors */
export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y
}

/** Cross product (returns scalar z-component for 2D) */
export function cross(a: Vec2, b: Vec2): number {
  return a.x * b.y - a.y * b.x
}

/** Rotate vector by angle (in radians) */
export function rotate(v: Vec2, angle: number): Vec2 {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return vec2(v.x * cos - v.y * sin, v.x * sin + v.y * cos)
}

/** Get perpendicular vector (rotated 90 degrees counter-clockwise) */
export function perpendicular(v: Vec2): Vec2 {
  return vec2(-v.y, v.x)
}

/** Linear interpolation between two vectors */
export function lerp(a: Vec2, b: Vec2, t: number): Vec2 {
  return vec2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t)
}

/** Get distance between two points */
export function distance(a: Vec2, b: Vec2): number {
  return length(subtract(b, a))
}

/** Get squared distance between two points (avoids sqrt) */
export function distanceSquared(a: Vec2, b: Vec2): number {
  return lengthSquared(subtract(b, a))
}

/** Create unit vector from angle (in radians, 0 = right, increases counter-clockwise) */
export function fromAngle(angle: number): Vec2 {
  return vec2(Math.cos(angle), Math.sin(angle))
}

/** Get angle of vector (in radians) */
export function toAngle(v: Vec2): number {
  return Math.atan2(v.y, v.x)
}

/** Clamp vector length to maximum */
export function clampLength(v: Vec2, maxLength: number): Vec2 {
  const len = length(v)
  if (len <= maxLength) {
    return v
  }
  return scale(normalize(v), maxLength)
}

/** Check if two vectors are approximately equal */
export function equals(a: Vec2, b: Vec2, epsilon = 1e-10): boolean {
  return Math.abs(a.x - b.x) < epsilon && Math.abs(a.y - b.y) < epsilon
}
