/**
 * Game configuration constants.
 * All tunable parameters are centralized here for easy adjustment.
 */

export const GAME_CONFIG = {
  /** Fixed timestep in seconds (60 ticks per second) */
  TICK_RATE: 60,
  TICK_DURATION: 1 / 60,

  /** Number of laps to complete the race */
  TOTAL_LAPS: 3,

  /** Canvas dimensions */
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 800,

  /** Car physics parameters */
  CAR: {
    /** Maximum forward speed in pixels per second */
    MAX_SPEED: 400,
    /** Maximum reverse speed in pixels per second */
    MAX_REVERSE_SPEED: 150,
    /** Acceleration rate in pixels per second squared */
    ACCELERATION: 300,
    /** Braking/reverse acceleration rate */
    BRAKE_ACCELERATION: 400,
    /** Natural friction deceleration */
    FRICTION: 100,
    /** Steering rate in radians per second at max speed */
    STEERING_RATE: 3.0,
    /** Minimum speed required for steering (prevents spinning in place) */
    MIN_STEERING_SPEED: 10,
    /** Car dimensions in pixels */
    WIDTH: 20,
    LENGTH: 40,
    /** Front indicator triangle length in pixels */
    FRONT_INDICATOR_LENGTH: 8,
    /** Front indicator margin from car edge in pixels */
    FRONT_INDICATOR_MARGIN: 2,
  },

  /** Camera settings */
  CAMERA: {
    /** How quickly camera follows the car (0-1, higher = faster) */
    FOLLOW_SMOOTHING: 0.1,
    /** Default zoom level */
    DEFAULT_ZOOM: 1.0,
  },

  /** Debug rendering options */
  DEBUG: {
    /** Show collision boundaries */
    SHOW_BOUNDARIES: false,
    /** Show checkpoints */
    SHOW_CHECKPOINTS: false,
    /** Show velocity vectors */
    SHOW_VELOCITY: false,
  },

  /** Theme colors for rendering */
  THEME: {
    BACKGROUND: '#1a1a2e',
    ROAD_SURFACE: '#3a3a5a',
    ROAD_BOUNDARY: '#ffffff',
    START_FINISH_LINE: '#ffcc00',
    CHECKPOINT: '#00ff00',
    CHECKPOINT_TEXT: '#00ff00',
    CAR_BODY: '#ff4444',
    CAR_FRONT: '#ffcc00',
    HUD_BACKGROUND: 'rgba(0, 0, 0, 0.7)',
    HUD_TEXT: '#ffffff',
    HUD_HINT_TEXT: 'rgba(255, 255, 255, 0.5)',
    BEST_LAP: '#ffcc00',
    VELOCITY_DEBUG: '#00ffff',
    RESULTS_OVERLAY: 'rgba(0, 0, 0, 0.8)',
    RESULTS_TOTAL: '#00ff00',
  },
} as const

export type GameConfig = typeof GAME_CONFIG
