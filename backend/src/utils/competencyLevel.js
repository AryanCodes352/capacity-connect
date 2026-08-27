/**
 * src/utils/competencyLevel.js — Single Source of Truth for Competency Logic
 *
 * ─── WHY THIS FILE IS CRITICAL ───────────────────────────────────────────────
 * Both the skill-gap engine and the assessment engine need to convert
 * percentage scores into competency levels, and gaps into priority labels.
 *
 * If this logic were duplicated across multiple files, changing the thresholds
 * would require hunting down every copy. Instead, all logic lives here —
 * every service that needs it imports from this one file.
 *
 * ─── CONFIGURATION ────────────────────────────────────────────────────────────
 * Modify LEVEL_THRESHOLDS and GAP_PRIORITY below to reconfigure the entire
 * platform's competency model without touching any other file.
 */

// ─── Score → Level Conversion ─────────────────────────────────────────────────
// Defines what percentage score maps to which competency level (1–4).
// Levels are ordered from lowest to highest.
// The system supports up to any number of levels — just add more entries.

const LEVEL_THRESHOLDS = [
  { min: 0,  max: 39,  level: 1, label: 'Beginner',     description: 'Basic awareness; needs significant development' },
  { min: 40, max: 59,  level: 2, label: 'Elementary',   description: 'Limited understanding; can perform with guidance' },
  { min: 60, max: 79,  level: 3, label: 'Intermediate', description: 'Solid working knowledge; independent performer' },
  { min: 80, max: 100, level: 4, label: 'Advanced',     description: 'Expert; can mentor others and lead in this area' },
];

// ─── Gap Priority Configuration ───────────────────────────────────────────────
// Maps a numeric gap size to a severity label and UI color.
// Gap = Required Level − Current Level

const GAP_PRIORITY = {
  0: { label: 'No Gap',   severity: 'NONE',     color: 'green',  textColor: 'text-green-600',  bgColor: 'bg-green-100' },
  1: { label: 'Medium',   severity: 'MEDIUM',   color: 'yellow', textColor: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  2: { label: 'High',     severity: 'HIGH',     color: 'orange', textColor: 'text-orange-600', bgColor: 'bg-orange-100' },
  3: { label: 'Critical', severity: 'CRITICAL', color: 'red',    textColor: 'text-red-600',    bgColor: 'bg-red-100' },
};

// Any gap >= this value is treated as CRITICAL
const MAX_GAP_KEY = 3;

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Convert an assessment percentage score into a competency level object.
 *
 * @param {number} score  A number between 0 and 100
 * @returns {{ level: number, label: string, description: string }}
 *
 * @example
 * scoreToLevel(72) // → { level: 3, label: 'Intermediate', description: '...' }
 * scoreToLevel(85) // → { level: 4, label: 'Advanced', description: '...' }
 */
function scoreToLevel(score) {
  if (typeof score !== 'number' || score < 0 || score > 100) {
    throw new Error(`Invalid score: ${score}. Must be a number between 0 and 100.`);
  }

  const threshold = LEVEL_THRESHOLDS.find(
    (t) => score >= t.min && score <= t.max
  );

  // Fallback — should never happen if thresholds cover 0–100 without gaps
  if (!threshold) {
    throw new Error(`No competency level found for score: ${score}`);
  }

  return {
    level: threshold.level,
    label: threshold.label,
    description: threshold.description,
  };
}

/**
 * Look up the competency level metadata for a given numeric level.
 *
 * @param {number} level  A level number (e.g. 1, 2, 3, 4)
 * @returns {{ level, label, description }}
 */
function getLevelInfo(level) {
  const threshold = LEVEL_THRESHOLDS.find((t) => t.level === level);
  if (!threshold) {
    throw new Error(`Invalid competency level: ${level}`);
  }
  return { level: threshold.level, label: threshold.label, description: threshold.description };
}

/**
 * Calculate the skill gap between required and current competency levels,
 * and return the gap with its priority metadata.
 *
 * @param {number} requiredLevel  The level required by the organizational role
 * @param {number} currentLevel   The employee's current level for this competency
 * @returns {{ gap: number, priority: object }}
 *
 * @example
 * calculateGap(4, 2)
 * // → { gap: 2, priority: { label: 'High', severity: 'HIGH', color: 'orange', ... } }
 */
function calculateGap(requiredLevel, currentLevel) {
  const gap = Math.max(0, requiredLevel - currentLevel); // Never negative
  const priorityKey = Math.min(gap, MAX_GAP_KEY);        // Cap at MAX_GAP_KEY for lookup
  const priority = GAP_PRIORITY[priorityKey];
  return { gap, priority };
}

/**
 * Return all level threshold definitions.
 * Useful for displaying level descriptions in the UI.
 */
function getAllLevels() {
  return LEVEL_THRESHOLDS.map((t) => ({
    level: t.level,
    label: t.label,
    description: t.description,
    scoreRange: `${t.min}%–${t.max}%`,
  }));
}

/**
 * Return all gap priority definitions.
 * Useful for rendering legend in skill-gap heatmaps.
 */
function getAllPriorities() {
  return Object.entries(GAP_PRIORITY).map(([gap, meta]) => ({
    gap: Number(gap),
    ...meta,
  }));
}

module.exports = {
  LEVEL_THRESHOLDS,
  GAP_PRIORITY,
  scoreToLevel,
  getLevelInfo,
  calculateGap,
  getAllLevels,
  getAllPriorities,
};
