/**
 * Canvas 2D renderer implementation.
 */

import type { Renderer } from './renderer'
import type { GameState } from '../core/types/game'
import type { CarState } from '../core/types/car'
import type { Track, LineSegment, Checkpoint } from '../core/types/track'
import type { Vec2 } from '../core/types/vector'
import { createCameraState, updateCamera, worldToScreen, type CameraState } from './camera'
import { GAME_CONFIG } from '../config'
import { formatTime, getCurrentLapTime, getBestLapTime } from '../core/game/lap-tracker'

export class CanvasRenderer implements Renderer {
  private readonly ctx: CanvasRenderingContext2D
  private readonly canvas: HTMLCanvasElement
  private camera: CameraState

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D context')
    }
    this.ctx = ctx
    this.camera = createCameraState({ x: canvas.width / 2, y: canvas.height / 2 })
  }

  render(state: GameState, _alpha: number): void {
    // Update camera to follow car
    this.camera = updateCamera(this.camera, state.car.position)

    // Clear canvas
    this.ctx.fillStyle = GAME_CONFIG.THEME.BACKGROUND
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Draw track
    this.drawTrack(state.track)

    // Draw checkpoints (debug mode)
    if (GAME_CONFIG.DEBUG.SHOW_CHECKPOINTS) {
      this.drawCheckpoints(state.track.checkpoints)
    }

    // Draw car
    this.drawCar(state.car)

    // Draw HUD
    this.drawHUD(state)

    // Draw results screen if finished
    if (state.status === 'finished') {
      this.drawResultsScreen(state)
    }
  }

  resize(width: number, height: number): void {
    this.canvas.width = width
    this.canvas.height = height
  }

  destroy(): void {
    // Nothing to clean up for Canvas 2D
  }

  private drawTrack(track: Track): void {
    // Draw road surface (area between boundaries)
    this.ctx.fillStyle = GAME_CONFIG.THEME.ROAD_SURFACE
    this.ctx.beginPath()

    // Draw outer boundary as fill
    if (track.outerBoundary.length > 0) {
      const firstOuter = this.toScreen(track.outerBoundary[0]!.start)
      this.ctx.moveTo(firstOuter.x, firstOuter.y)

      for (const segment of track.outerBoundary) {
        const end = this.toScreen(segment.end)
        this.ctx.lineTo(end.x, end.y)
      }
      this.ctx.closePath()
      this.ctx.fill()
    }

    // Cut out inner boundary (if exists)
    if (track.innerBoundary.length > 0) {
      this.ctx.fillStyle = GAME_CONFIG.THEME.BACKGROUND
      this.ctx.beginPath()
      const firstInner = this.toScreen(track.innerBoundary[0]!.start)
      this.ctx.moveTo(firstInner.x, firstInner.y)

      for (const segment of track.innerBoundary) {
        const end = this.toScreen(segment.end)
        this.ctx.lineTo(end.x, end.y)
      }
      this.ctx.closePath()
      this.ctx.fill()
    }

    // Draw boundary lines
    this.ctx.strokeStyle = GAME_CONFIG.THEME.ROAD_BOUNDARY
    this.ctx.lineWidth = 3

    this.drawBoundary(track.outerBoundary)
    this.drawBoundary(track.innerBoundary)

    // Draw start/finish line
    if (track.checkpoints.length > 0) {
      const startFinish = track.checkpoints[0]!
      this.ctx.strokeStyle = GAME_CONFIG.THEME.START_FINISH_LINE
      this.ctx.lineWidth = 4
      this.drawLineSegment(startFinish.segment)
    }
  }

  private drawBoundary(segments: readonly LineSegment[]): void {
    for (const segment of segments) {
      this.drawLineSegment(segment)
    }
  }

  private drawLineSegment(segment: LineSegment): void {
    const start = this.toScreen(segment.start)
    const end = this.toScreen(segment.end)

    this.ctx.beginPath()
    this.ctx.moveTo(start.x, start.y)
    this.ctx.lineTo(end.x, end.y)
    this.ctx.stroke()
  }

  private drawCheckpoints(checkpoints: readonly Checkpoint[]): void {
    this.ctx.strokeStyle = GAME_CONFIG.THEME.CHECKPOINT
    this.ctx.lineWidth = 2

    for (const checkpoint of checkpoints) {
      if (checkpoint.index === 0) continue // Skip start/finish (already drawn)
      this.drawLineSegment(checkpoint.segment)

      // Draw checkpoint number
      const center = this.toScreen({
        x: (checkpoint.segment.start.x + checkpoint.segment.end.x) / 2,
        y: (checkpoint.segment.start.y + checkpoint.segment.end.y) / 2,
      })
      this.ctx.fillStyle = GAME_CONFIG.THEME.CHECKPOINT_TEXT
      this.ctx.font = '14px monospace'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(checkpoint.index.toString(), center.x, center.y)
    }
  }

  private drawCar(car: CarState): void {
    const screenPos = this.toScreen(car.position)
    const carWidth = GAME_CONFIG.CAR.WIDTH * this.camera.zoom
    const carLength = GAME_CONFIG.CAR.LENGTH * this.camera.zoom

    this.ctx.save()
    this.ctx.translate(screenPos.x, screenPos.y)
    this.ctx.rotate(car.rotation)

    // Car body
    this.ctx.fillStyle = GAME_CONFIG.THEME.CAR_BODY
    this.ctx.fillRect(-carLength / 2, -carWidth / 2, carLength, carWidth)

    // Car front indicator (triangle)
    const indicatorLength = GAME_CONFIG.CAR.FRONT_INDICATOR_LENGTH
    const indicatorMargin = GAME_CONFIG.CAR.FRONT_INDICATOR_MARGIN
    this.ctx.fillStyle = GAME_CONFIG.THEME.CAR_FRONT
    this.ctx.beginPath()
    this.ctx.moveTo(carLength / 2, 0)
    this.ctx.lineTo(carLength / 2 - indicatorLength, -carWidth / 2 + indicatorMargin)
    this.ctx.lineTo(carLength / 2 - indicatorLength, carWidth / 2 - indicatorMargin)
    this.ctx.closePath()
    this.ctx.fill()

    this.ctx.restore()

    // Draw velocity vector (debug)
    if (GAME_CONFIG.DEBUG.SHOW_VELOCITY) {
      const velScale = 0.2
      const velEnd = this.toScreen({
        x: car.position.x + car.velocity.x * velScale,
        y: car.position.y + car.velocity.y * velScale,
      })
      this.ctx.strokeStyle = GAME_CONFIG.THEME.VELOCITY_DEBUG
      this.ctx.lineWidth = 2
      this.ctx.beginPath()
      this.ctx.moveTo(screenPos.x, screenPos.y)
      this.ctx.lineTo(velEnd.x, velEnd.y)
      this.ctx.stroke()
    }
  }

  private drawHUD(state: GameState): void {
    const padding = 20
    const lineHeight = 30

    this.ctx.fillStyle = GAME_CONFIG.THEME.HUD_BACKGROUND
    this.ctx.fillRect(padding - 10, padding - 10, 220, 120)

    this.ctx.fillStyle = GAME_CONFIG.THEME.HUD_TEXT
    this.ctx.font = 'bold 20px monospace'
    this.ctx.textAlign = 'left'

    // Lap counter
    this.ctx.fillText(
      `Lap: ${Math.min(state.timing.currentLap, state.totalLaps)} / ${state.totalLaps}`,
      padding,
      padding + lineHeight
    )

    // Current lap time
    const currentLapTime = getCurrentLapTime(state.timing)
    this.ctx.fillText(
      `Time: ${formatTime(currentLapTime)}`,
      padding,
      padding + lineHeight * 2
    )

    // Best lap time
    const bestLap = getBestLapTime(state.timing)
    if (bestLap) {
      this.ctx.fillStyle = GAME_CONFIG.THEME.BEST_LAP
      this.ctx.fillText(
        `Best: ${formatTime(bestLap.timeMs)}`,
        padding,
        padding + lineHeight * 3
      )
    }

    // Controls hint at bottom
    this.ctx.fillStyle = GAME_CONFIG.THEME.HUD_HINT_TEXT
    this.ctx.font = '14px monospace'
    this.ctx.textAlign = 'center'
    this.ctx.fillText(
      'WASD or Arrow keys to drive',
      this.canvas.width / 2,
      this.canvas.height - padding
    )
  }

  private drawResultsScreen(state: GameState): void {
    // Darken background
    this.ctx.fillStyle = GAME_CONFIG.THEME.RESULTS_OVERLAY
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    // Title
    this.ctx.fillStyle = GAME_CONFIG.THEME.HUD_TEXT
    this.ctx.font = 'bold 48px monospace'
    this.ctx.textAlign = 'center'
    this.ctx.fillText('RACE COMPLETE!', centerX, centerY - 150)

    // Lap times
    this.ctx.font = '24px monospace'
    state.timing.lapTimes.forEach((lap, index) => {
      const y = centerY - 80 + index * 40
      const isBest = getBestLapTime(state.timing)?.lapNumber === lap.lapNumber
      this.ctx.fillStyle = isBest ? GAME_CONFIG.THEME.BEST_LAP : GAME_CONFIG.THEME.HUD_TEXT
      this.ctx.fillText(
        `Lap ${lap.lapNumber}: ${formatTime(lap.timeMs)}${isBest ? ' (BEST)' : ''}`,
        centerX,
        y
      )
    })

    // Total time
    const totalTime = state.timing.lapTimes.reduce((sum, lap) => sum + lap.timeMs, 0)
    this.ctx.fillStyle = GAME_CONFIG.THEME.RESULTS_TOTAL
    this.ctx.font = 'bold 28px monospace'
    this.ctx.fillText(
      `Total: ${formatTime(totalTime)}`,
      centerX,
      centerY + 60
    )

    // Restart hint
    this.ctx.fillStyle = GAME_CONFIG.THEME.HUD_TEXT
    this.ctx.font = '20px monospace'
    this.ctx.fillText('Press R to restart', centerX, centerY + 120)
  }

  private toScreen(worldPos: Vec2): Vec2 {
    return worldToScreen(
      worldPos,
      this.camera,
      this.canvas.width,
      this.canvas.height
    )
  }
}
