/**
 * Input command representing player controls for a single tick.
 * Values are normalized: -1 to 1 for steering, 0 to 1 for throttle/brake.
 */

export interface InputCommand {
  /** Throttle input: 0 (none) to 1 (full) */
  readonly throttle: number
  /** Brake input: 0 (none) to 1 (full) */
  readonly brake: number
  /** Steering input: -1 (full left) to 1 (full right) */
  readonly steering: number
}

/** No input (neutral state) */
export const INPUT_NONE: InputCommand = {
  throttle: 0,
  brake: 0,
  steering: 0,
}

/** Create an input command with validation */
export function createInputCommand(
  throttle: number,
  brake: number,
  steering: number
): InputCommand {
  return {
    throttle: Math.max(0, Math.min(1, throttle)),
    brake: Math.max(0, Math.min(1, brake)),
    steering: Math.max(-1, Math.min(1, steering)),
  }
}
