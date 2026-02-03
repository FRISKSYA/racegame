/**
 * Track-related types for defining race courses.
 */

import type { Vec2 } from './vector'

/** A line segment defined by two points */
export interface LineSegment {
  readonly start: Vec2
  readonly end: Vec2
}

/** A checkpoint that cars must pass through */
export interface Checkpoint {
  /** Line segment defining the checkpoint */
  readonly segment: LineSegment
  /** Index in the checkpoint sequence (0 = start/finish line) */
  readonly index: number
}

/** Complete track definition */
export interface Track {
  /** Display name of the track */
  readonly name: string
  /** Outer boundary segments */
  readonly outerBoundary: readonly LineSegment[]
  /** Inner boundary segments (for tracks with islands/obstacles) */
  readonly innerBoundary: readonly LineSegment[]
  /** Checkpoints in order (first is start/finish) */
  readonly checkpoints: readonly Checkpoint[]
  /** Starting position for the car */
  readonly startPosition: Vec2
  /** Starting rotation for the car (radians) */
  readonly startRotation: number
}

/** Create a line segment */
export function createLineSegment(start: Vec2, end: Vec2): LineSegment {
  return { start, end }
}

/** Create a checkpoint */
export function createCheckpoint(
  segment: LineSegment,
  index: number
): Checkpoint {
  return { segment, index }
}
