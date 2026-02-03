/**
 * Camera system for following the player car.
 */

import type { Vec2 } from '../core/types/vector'
import { vec2, lerp } from '../core/types/vector'
import { GAME_CONFIG } from '../config'

export interface CameraState {
  readonly position: Vec2
  readonly zoom: number
}

/**
 * Create initial camera state.
 */
export function createCameraState(position: Vec2): CameraState {
  return {
    position,
    zoom: GAME_CONFIG.CAMERA.DEFAULT_ZOOM,
  }
}

/**
 * Update camera to follow a target position smoothly.
 */
export function updateCamera(
  camera: CameraState,
  targetPosition: Vec2,
  smoothing: number = GAME_CONFIG.CAMERA.FOLLOW_SMOOTHING
): CameraState {
  const newPosition = lerp(camera.position, targetPosition, smoothing)
  return {
    ...camera,
    position: newPosition,
  }
}

/**
 * Convert world coordinates to screen coordinates.
 */
export function worldToScreen(
  worldPos: Vec2,
  camera: CameraState,
  screenWidth: number,
  screenHeight: number
): Vec2 {
  const screenCenterX = screenWidth / 2
  const screenCenterY = screenHeight / 2

  const offsetX = (worldPos.x - camera.position.x) * camera.zoom
  const offsetY = (worldPos.y - camera.position.y) * camera.zoom

  return vec2(screenCenterX + offsetX, screenCenterY + offsetY)
}

/**
 * Convert screen coordinates to world coordinates.
 */
export function screenToWorld(
  screenPos: Vec2,
  camera: CameraState,
  screenWidth: number,
  screenHeight: number
): Vec2 {
  const screenCenterX = screenWidth / 2
  const screenCenterY = screenHeight / 2

  const offsetX = (screenPos.x - screenCenterX) / camera.zoom
  const offsetY = (screenPos.y - screenCenterY) / camera.zoom

  return vec2(camera.position.x + offsetX, camera.position.y + offsetY)
}
