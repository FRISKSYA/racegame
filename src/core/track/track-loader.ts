/**
 * Track loading and creation utilities.
 */

import { z } from 'zod'
import type { Track, LineSegment, Checkpoint } from '../types/track'
import { vec2 } from '../types/vector'
import { createLineSegment, createCheckpoint } from '../types/track'

/**
 * Create a simple oval track for testing.
 */
export function createOvalTrack(): Track {
  const centerX = 600
  const centerY = 400
  const outerWidth = 500
  const outerHeight = 300
  const trackWidth = 100

  const innerWidth = outerWidth - trackWidth
  const innerHeight = outerHeight - trackWidth

  // Create oval boundaries using line segments
  const outerBoundary = createOvalBoundary(centerX, centerY, outerWidth, outerHeight, 32)
  const innerBoundary = createOvalBoundary(centerX, centerY, innerWidth, innerHeight, 32)

  // Create checkpoints (4 checkpoints: start/finish + 3 intermediate)
  const checkpoints = createOvalCheckpoints(
    centerX,
    centerY,
    innerWidth,
    outerWidth,
    innerHeight,
    outerHeight
  )

  return {
    name: 'Oval Circuit',
    outerBoundary,
    innerBoundary,
    checkpoints,
    // Start position at the bottom of the track, facing right
    startPosition: vec2(centerX - outerWidth / 2 + trackWidth / 2 + 30, centerY + outerHeight / 2 - trackWidth / 2),
    startRotation: 0, // Facing right
  }
}

/**
 * Create oval boundary as line segments.
 */
function createOvalBoundary(
  centerX: number,
  centerY: number,
  radiusX: number,
  radiusY: number,
  segments: number
): LineSegment[] {
  const points: { x: number; y: number }[] = []

  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    points.push({
      x: centerX + Math.cos(angle) * radiusX,
      y: centerY + Math.sin(angle) * radiusY,
    })
  }

  const boundary: LineSegment[] = []
  for (let i = 0; i < segments; i++) {
    const start = points[i]!
    const end = points[(i + 1) % segments]!
    boundary.push(createLineSegment(vec2(start.x, start.y), vec2(end.x, end.y)))
  }

  return boundary
}

/**
 * Create checkpoints for an oval track.
 */
function createOvalCheckpoints(
  centerX: number,
  centerY: number,
  innerWidth: number,
  outerWidth: number,
  innerHeight: number,
  outerHeight: number
): Checkpoint[] {
  // 4 checkpoints at cardinal positions
  const checkpoints: Checkpoint[] = []

  // Start/finish line (left side, vertical)
  checkpoints.push(
    createCheckpoint(
      createLineSegment(
        vec2(centerX - outerWidth, centerY),
        vec2(centerX - innerWidth, centerY)
      ),
      0
    )
  )

  // Checkpoint 1 (top, horizontal)
  checkpoints.push(
    createCheckpoint(
      createLineSegment(
        vec2(centerX, centerY - outerHeight),
        vec2(centerX, centerY - innerHeight)
      ),
      1
    )
  )

  // Checkpoint 2 (right side, vertical)
  checkpoints.push(
    createCheckpoint(
      createLineSegment(
        vec2(centerX + innerWidth, centerY),
        vec2(centerX + outerWidth, centerY)
      ),
      2
    )
  )

  // Checkpoint 3 (bottom, horizontal)
  checkpoints.push(
    createCheckpoint(
      createLineSegment(
        vec2(centerX, centerY + innerHeight),
        vec2(centerX, centerY + outerHeight)
      ),
      3
    )
  )

  return checkpoints
}

/**
 * Line segment schema for boundary validation.
 */
const LineSegmentSchema = z.object({
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
})

/**
 * Checkpoint schema for validation.
 */
const CheckpointSchema = z.object({
  x1: z.number(),
  y1: z.number(),
  x2: z.number(),
  y2: z.number(),
  index: z.number().int().nonnegative(),
})

/**
 * Track JSON schema for validation using Zod.
 */
const TrackJsonSchema = z.object({
  name: z.string().min(1, 'Track name cannot be empty'),
  outerBoundary: z.array(LineSegmentSchema).min(1, 'Outer boundary must have at least 1 segment'),
  innerBoundary: z.array(LineSegmentSchema),
  checkpoints: z.array(CheckpointSchema).min(1, 'Track must have at least 1 checkpoint'),
  startX: z.number(),
  startY: z.number(),
  startRotation: z.number(),
})

/**
 * Track JSON schema for loading custom tracks.
 */
export type TrackJson = z.infer<typeof TrackJsonSchema>

/**
 * Load track from JSON data with validation.
 * @throws {z.ZodError} if validation fails
 */
export function loadTrackFromJson(json: unknown): Track {
  const validated = TrackJsonSchema.parse(json)

  const outerBoundary = validated.outerBoundary.map((seg) =>
    createLineSegment(vec2(seg.x1, seg.y1), vec2(seg.x2, seg.y2))
  )

  const innerBoundary = validated.innerBoundary.map((seg) =>
    createLineSegment(vec2(seg.x1, seg.y1), vec2(seg.x2, seg.y2))
  )

  const checkpoints = validated.checkpoints.map((cp) =>
    createCheckpoint(
      createLineSegment(vec2(cp.x1, cp.y1), vec2(cp.x2, cp.y2)),
      cp.index
    )
  )

  return {
    name: validated.name,
    outerBoundary,
    innerBoundary,
    checkpoints,
    startPosition: vec2(validated.startX, validated.startY),
    startRotation: validated.startRotation,
  }
}
