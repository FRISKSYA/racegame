/**
 * Keyboard input source.
 * Maps keyboard keys to game input commands.
 */

import type { InputSource } from './input-source'
import type { InputCommand } from '../types/input'

interface KeyState {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

/**
 * Keyboard input implementation.
 * Supports WASD and arrow keys.
 */
export class KeyboardInput implements InputSource {
  private keys: KeyState = {
    up: false,
    down: false,
    left: false,
    right: false,
  }

  private readonly handleKeyDown: (e: KeyboardEvent) => void
  private readonly handleKeyUp: (e: KeyboardEvent) => void
  private onRestartCallback: (() => void) | null = null

  constructor() {
    this.handleKeyDown = this.onKeyDown.bind(this)
    this.handleKeyUp = this.onKeyUp.bind(this)
  }

  /** Set callback for restart key (R) */
  setOnRestart(callback: () => void): void {
    this.onRestartCallback = callback
  }

  getInput(): InputCommand {
    const throttle = this.keys.up ? 1 : 0
    const brake = this.keys.down ? 1 : 0

    let steering = 0
    if (this.keys.left) steering -= 1
    if (this.keys.right) steering += 1

    return {
      throttle,
      brake,
      steering,
    }
  }

  start(): void {
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)
  }

  stop(): void {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)
    this.resetKeys()
  }

  private onKeyDown(e: KeyboardEvent): void {
    // Handle restart key
    if (e.code === 'KeyR') {
      this.onRestartCallback?.()
      e.preventDefault()
      return
    }

    const key = this.mapKey(e.code)
    if (key) {
      this.keys = { ...this.keys, [key]: true }
      e.preventDefault()
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    const key = this.mapKey(e.code)
    if (key) {
      this.keys = { ...this.keys, [key]: false }
      e.preventDefault()
    }
  }

  private mapKey(code: string): keyof KeyState | null {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        return 'up'
      case 'KeyS':
      case 'ArrowDown':
        return 'down'
      case 'KeyA':
      case 'ArrowLeft':
        return 'left'
      case 'KeyD':
      case 'ArrowRight':
        return 'right'
      default:
        return null
    }
  }

  private resetKeys(): void {
    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false,
    }
  }
}
