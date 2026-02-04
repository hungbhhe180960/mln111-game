/**
 * saveGame utilities
 *
 * Responsibilities:
 * - saveGame(state): serialize and persist GameState to localStorage with metadata
 * - loadGame(): load and validate saved GameState
 * - hasSaveGame(), deleteSaveGame()
 * - setupAutoSave(store): helper to attach an autosave subscription to a Zustand store
 *
 * Notes:
 * - Uses key "game_save" in localStorage as requested.
 * - Save payload includes a timestamp and format version for future migrations.
 * - Validation is conservative: checks required shape and numeric ranges for core fields.
 */

import type { GameState } from '../types/game.types'
import type { StoreApi } from 'zustand'

const SAVE_KEY = 'game_save'
const SAVE_VERSION = 'mua-on-thi-v1'

type SavePayload = {
    version: string
    savedAt: string // ISO timestamp
    state: Partial<GameState> // we persist the serializable parts
}

/**
 * Basic runtime validation for a loaded object to match GameState shape.
 * This is intentionally conservative: it checks presence and basic types / ranges.
 */
function validateGameState(obj: any): obj is GameState {
    if (!obj || typeof obj !== 'object') return false
    // required root fields
    if (typeof obj.day !== 'number' || obj.day < 1 || obj.day > 999) return false
    if (typeof obj.time !== 'string') return false
    if (!obj.stats || typeof obj.stats !== 'object') return false

    const s = obj.stats
    const numericKeys = ['knowledge', 'health', 'stress', 'consciousness', 'sleepless_count', 'money']
    for (const k of numericKeys) {
        if (typeof s[k] !== 'number' || Number.isNaN(s[k])) return false
    }

    if (!obj.flags || typeof obj.flags !== 'object') return false
    // history should be an array (choices can be serialized objects)
    if (!Array.isArray(obj.history)) return false

    // basic optional checks
    if (obj.currentEvent !== null && typeof obj.currentEvent !== 'string') return false

    return true
}

/**
 * Serialize and save GameState to localStorage
 */
export function saveGame(state: GameState): void {
    try {
        const payload: SavePayload = {
            version: SAVE_VERSION,
            savedAt: new Date().toISOString(),
            state: stripNonSerializable(state),
        }
        const raw = JSON.stringify(payload)
        localStorage.setItem(SAVE_KEY, raw)
    } catch (err) {
        // swallow but log; storage might be full or blocked by user
        // eslint-disable-next-line no-console
        console.warn('saveGame failed:', err)
    }
}

/**
 * Load saved GameState from localStorage
 * Returns GameState or null if not found/corrupt/invalid
 */
export function loadGame(): GameState | null {
    try {
        const raw = localStorage.getItem(SAVE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as SavePayload
        if (!parsed || typeof parsed !== 'object') return null
        // Basic version check (we accept same version or attempt)
        // parsed.version may be used for migrations in future
        const candidate = parsed.state
        if (!candidate) return null
        // Validate thoroughly
        if (!validateGameState(candidate)) {
            // corrupted or incompatible
            return null
        }
        return candidate as GameState
    } catch (err) {
        // parse error or other
        // eslint-disable-next-line no-console
        console.warn('loadGame failed:', err)
        return null
    }
}

/**
 * Check whether a saved game exists and is valid
 */
export function hasSaveGame(): boolean {
    try {
        const raw = localStorage.getItem(SAVE_KEY)
        if (!raw) return false
        const parsed = JSON.parse(raw) as SavePayload
        if (!parsed || typeof parsed !== 'object') return false
        if (!parsed.state) return false
        return validateGameState(parsed.state)
    } catch {
        return false
    }
}

/**
 * Delete saved game
 */
export function deleteSaveGame(): void {
    try {
        localStorage.removeItem(SAVE_KEY)
    } catch (err) {
        // ignore
        // eslint-disable-next-line no-console
        console.warn('deleteSaveGame failed', err)
    }
}

/**
 * stripNonSerializable:
 * - Removes function references and other non-JSON data from the GameState before saving.
 * - In particular, Choice / Event objects might include runtime 'condition' functions;
 *   we must strip those out.
 */
function stripNonSerializable(state: GameState): Partial<GameState> {
    // shallow copy basic primitives
    const out: Partial<GameState> = {
        day: state.day,
        time: state.time,
        stats: { ...state.stats },
        flags: { ...state.flags },
        currentEvent: state.currentEvent,
        // history: serialize choices without functions
        history: state.history.map(h => {
            const copy: any = { ...h } // Choice
            // remove potential function fields
            if (typeof copy.condition === 'function') delete copy.condition
            return copy
        }),
    }
    return out
}

/**
 * setupAutoSave:
 * - Attach a subscription to a zustand store to autosave on relevant changes.
 * - It will listen for changes and call saveGame(...) with current GameState when:
 *   * history length changes (choice made)
 *   * currentEvent changes (event transition)
 *   * optionally on other triggers
 *
 * Usage:
 *   import { useGameStore } from '../stores/gameStore'
 *   import { setupAutoSave } from '../utils/saveGame'
 *   // after store creation time (e.g., app mount)
 *   const unsubscribe = setupAutoSave(useGameStore)
 *
 * Returns unsubscribe function.
 */
export function setupAutoSave<S extends { getState: () => any; subscribe: (listener: (state: any, prevState: any) => void) => () => void }>(
    store: StoreApi<any>
): () => void {
    let prevSnapshot: any
    try {
        prevSnapshot = store.getState()
    } catch {
        prevSnapshot = {}
    }

    const unsubscribe = store.subscribe((newState: any, oldState: any) => {
        try {
            // Detect relevant changes:
            const prevHistoryLen = (oldState && oldState.history && Array.isArray(oldState.history)) ? oldState.history.length : -1
            const newHistoryLen = (newState && newState.history && Array.isArray(newState.history)) ? newState.history.length : -1
            const prevEvent = oldState?.currentEvent ?? oldState?.currentEventId ?? null
            const newEvent = newState?.currentEvent ?? newState?.currentEventId ?? null

            // Save when:
            // - history length changed (a new choice was made)
            // - currentEvent changed (event transition)
            if (newHistoryLen !== prevHistoryLen || prevEvent !== newEvent) {
                // Build minimal GameState-like object expected by saveGame
                const stateToSave: GameState = {
                    day: newState.day,
                    time: newState.time,
                    stats: { ...newState.stats },
                    flags: { ...newState.flags },
                    currentEvent: newEvent,
                    history: (newState.history && Array.isArray(newState.history)) ? newState.history.map((h: any) => {
                        const copy: any = { ...h }
                        if (typeof copy.condition === 'function') delete copy.condition
                        return copy
                    }) : [],
                }
                saveGame(stateToSave)
            }
        } catch (err) {
            // swallow errors from autosave to avoid breaking game loop
            // eslint-disable-next-line no-console
            console.warn('autosave handler error:', err)
        }
    })

    return unsubscribe
}

export default {
    saveGame,
    loadGame,
    hasSaveGame,
    deleteSaveGame,
    setupAutoSave,
}