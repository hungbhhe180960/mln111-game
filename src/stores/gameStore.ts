import { create } from 'zustand'
import type { GameState, GameEvent, Choice, Stats } from '../types/game.types'
import { EVENTS } from '../data/events'
import { ENDINGS } from '../data/endings'
import { ACHIEVEMENTS } from '../data/achievements'

const MAX_DAY = 7 // allow day 7 (exam day)

// Convert EVENTS object -> array for easy searching
const EVENT_LIST: GameEvent[] = Object.values(EVENTS)

function findStartEventForDay(day: number): GameEvent | null {
    const explicitStart = EVENT_LIST.find(e => e.id === `day${day}_start`)
    if (explicitStart) return explicitStart

    // fallback to first event with matching day
    const firstOfDay = EVENT_LIST.find(e => e.day === day)
    if (firstOfDay) {
        console.warn(`[ENGINE] day${day}_start missing, fallback to ${firstOfDay.id}`)
        return firstOfDay
    }

    return null
}

function getEventById(id: string | undefined | null): GameEvent | null {
    if (!id) return null
    return EVENT_LIST.find(e => e.id === id) ?? null
}

function clampStat(key: keyof Stats, value: number) {
    if (key === 'money') {
        return Math.max(0, Math.round(value))
    }
    if (key === 'sleepless_count') {
        return Math.max(0, Math.round(value))
    }
    // other stats 0..100
    return Math.max(0, Math.min(100, Math.round(value)))
}

type StoreState = {
    day: number
    time: string
    stats: Stats
    flags: Record<string, boolean>
    currentEventId: string
    history: Choice[]
    endingId: string | null
    achievements: string[]

    // getters
    currentEvent: () => GameEvent | null
    isGameEnded: () => boolean

    // actions
    startGame: () => void
    resetGame: () => void
    applyChoice: (choice: Choice) => void
    nextDay: () => void
    evaluateEnding: () => void
    evaluateAchievements: () => void

    // helper exposed for debugging
    resolveNextDay: () => string | null
}

export const useGameStore = create<StoreState>((set, get) => ({
    // ===== STATE =====
    day: 1,
    time: '08:00',
    // initialize full stats shape (missing keys before caused many condition checks to fail)
    stats: {
        knowledge: 50,
        health: 70,
        stress: 0,
        consciousness: 50,
        sleepless_count: 0,
        money: 200000,
    },
    flags: {},
    currentEventId: '',
    history: [],
    endingId: null,
    achievements: [],

    // ===== GETTERS =====
    currentEvent() {
        return EVENT_LIST.find(e => e.id === get().currentEventId) ?? null
    },

    isGameEnded() {
        return !!get().endingId
    },

    // ===== ACTIONS =====
    startGame() {
        const startEvent = findStartEventForDay(1)
        if (!startEvent) {
            throw new Error('[ENGINE] No start event for day 1')
        }

        set({
            day: 1,
            time: startEvent.time ?? '08:00',
            currentEventId: startEvent.id,
            history: [],
            endingId: null,
            achievements: [],
            flags: {},
            // keep stats as initially defined
        })
    },

    resetGame() {
        const startEvent = findStartEventForDay(1)

        set({
            day: 1,
            time: startEvent?.time ?? '08:00',
            currentEventId: startEvent?.id ?? '',
            stats: {
                knowledge: 50,
                health: 70,
                stress: 0,
                consciousness: 50,
                sleepless_count: 0,
                money: 200000,
            },
            flags: {},
            history: [],
            endingId: null,
            achievements: [],
        })
    },

    /**
     * Apply a chosen option (Choice).
     * - Correctly handle effects structure (events use Partial<Stats> directly)
     * - Special-case sleepless_count: events now use 0 to reset, 1 to indicate "stayed up"
     *   -> if effect.sleepless_count === 0 => set to 0
     *   -> if effect.sleepless_count === 1 => increment by 1 (accumulate consecutive nights awake)
     * - Apply flags from choice.flags (array)
     * - Follow nextEvent (choice.nextEvent). If nextEvent === 'resolve_next_day' we call resolveNextDay()
     * - If choice.nextEvent points to an event that exists but its condition returns false, we fallback:
     *      1) try to find another event on the same day/time with a truthy condition,
     *      2) otherwise call nextDay()
     */
    applyChoice(choice) {
        const event = get().currentEvent()
        if (!event) return

        // record history (store the choice object)
        set(state => ({ history: [...state.history, choice] }))

        // Apply stat changes (choice.effects is Partial<Stats>)
        if (choice.effects) {
            set(state => {
                const updated: Stats = { ...state.stats }

                Object.entries(choice.effects as Partial<Stats>).forEach(([k, v]) => {
                    const key = k as keyof Stats
                    const val = Number(v)

                    if (key === 'sleepless_count') {
                        // Standard semantics:
                        // 0 => reset to 0 (slept)
                        // 1 => stayed up this night => increment consecutive sleepless_count by 1
                        if (val <= 0) {
                            updated.sleepless_count = 0
                        } else if (val === 1) {
                            updated.sleepless_count = clampStat('sleepless_count', updated.sleepless_count + 1)
                        } else {
                            // if data gives absolute positive number, set to that
                            updated.sleepless_count = clampStat('sleepless_count', val)
                        }
                        return
                    }

                    // other stats treated as deltas (positive/negative)
                    const currentValue = (updated as any)[key]
                    const prev = typeof currentValue === 'number' ? currentValue : 0
                    (updated as any)[key] = clampStat(key, prev + val)
                })

                return { stats: updated }
            })
        }

        // Apply flags (choice.flags is an array of flag strings)
        if (Array.isArray(choice.flags) && choice.flags.length > 0) {
            set(state => {
                const nextFlags = { ...state.flags }
                choice.flags!.forEach((f: string) => (nextFlags[f] = true))
                return { flags: nextFlags }
            })
        }

        // Determine next event
        const nextId = (choice as any).nextEvent ?? (choice as any).nextEventId ?? null

        if (nextId) {
            // Special resolver token (engine-level)
            if (nextId === 'resolve_next_day') {
                const resolved = get().resolveNextDay()
                if (resolved) {
                    set(state => ({ currentEventId: resolved, time: EVENT_LIST.find(e => e.id === resolved)?.time ?? '08:00' }))
                    return
                } else {
                    // fallback to nextDay if resolver couldn't find event
                    get().nextDay()
                    return
                }
            }

            // If target exists and condition passes (if any), jump to it.
            const targetEvent = getEventById(nextId)
            if (targetEvent) {
                // evaluate condition if present
                if (typeof targetEvent.condition === 'function') {
                    try {
                        const gameStateSnapshot: GameState = {
                            day: get().day,
                            time: get().time,
                            stats: get().stats,
                            flags: get().flags,
                            currentEvent: get().currentEventId,
                            history: get().history,
                        }
                        const ok = targetEvent.condition(gameStateSnapshot)
                        if (!ok) {
                            console.warn(`[ENGINE] target event ${nextId} condition false, falling back to nextDay()`)
                            get().nextDay()
                            return
                        }
                    } catch (err) {
                        console.warn('[ENGINE] condition threw for targetEvent', nextId, err)
                        get().nextDay()
                        return
                    }
                }

                set({ currentEventId: targetEvent.id, time: targetEvent.time ?? get().time })
                return
            } else {
                console.warn(`[ENGINE] nextEvent ${nextId} not found -> fallback to nextDay`)
                get().nextDay()
                return
            }
        }

        // If no explicit nextEvent, advance to the next day (legacy behavior)
        get().nextDay()
    },

    /**
     * Advance to the next day and pick a start event.
     */
    nextDay() {
        const nextDay = get().day + 1

        if (nextDay > MAX_DAY) {
            get().evaluateEnding()
            return
        }

        const startEvent = findStartEventForDay(nextDay)

        if (!startEvent) {
            console.error(`[ENGINE] No event found for day ${nextDay}`)
            get().evaluateEnding()
            return
        }

        set({
            day: nextDay,
            time: startEvent.time ?? '08:00',
            currentEventId: startEvent.id,
        })
    },

    /**
     * Evaluate endings based on ENDINGS registry
     */
    evaluateEnding() {
        const state = get()
        const matchedEnding = ENDINGS.find(e => {
            try {
                return e.condition({
                    day: state.day,
                    time: state.time,
                    stats: state.stats,
                    flags: state.flags,
                    currentEvent: state.currentEventId,
                    history: state.history,
                })
            } catch (err) {
                console.warn('Ending condition threw', err)
                return false
            }
        })

        set({
            endingId: matchedEnding?.id ?? 'normal_end',
        })

        get().evaluateAchievements()
    },

    /**
     * Evaluate achievements and store unlocked ids
     */
    evaluateAchievements() {
        const state = get()
        const unlocked = ACHIEVEMENTS.filter(a => {
            try {
                return a.condition({
                    day: state.day,
                    time: state.time,
                    stats: state.stats,
                    flags: state.flags,
                    currentEvent: state.currentEventId,
                    history: state.history,
                })
            } catch (err) {
                console.warn('achievement condition threw', err)
                return false
            }
        }).map(a => a.id)

        set({ achievements: unlocked })
    },

    /**
     * Resolve the next day token.
     * - This is the engine-level resolver for 'resolve_next_day'.
     * - It MUST increment the day (the canonical place to do so).
     * - It chooses which event to go to next (hospital check or normal start / special morning).
     *
     * Return: the resolved event id (string) or null if nothing found.
     */
    resolveNextDay() {
        const state = get()
        const nextDay = state.day + 1

        // If we are already at or beyond MAX_DAY, end the game
        if (nextDay > MAX_DAY) {
            console.debug('[ENGINE] resolveNextDay -> exceed MAX_DAY, evaluating ending')
            get().evaluateEnding()
            return null
        }

        // increment day first (engine-side)
        set({ day: nextDay })

        // Helper to pick by priority
        const shouldHospitalize = state.stats.sleepless_count >= 2 || state.stats.health <= 0

        // day-specific routing
        if (nextDay === 2) {
            const target = getEventById('day2_morning_check') ?? getEventById('day2_start') ?? findStartEventForDay(2)
            if (target) return target.id
        }

        if (nextDay === 3) {
            if (shouldHospitalize) {
                return getEventById('day3_hospital_check')?.id ?? getEventById('day3_start')?.id ?? null
            }
            return getEventById('day3_main_event')?.id ?? getEventById('day3_start')?.id ?? null
        }

        if (nextDay === 4) {
            if (shouldHospitalize) {
                return getEventById('day4_start_after_hospital')?.id ?? getEventById('day4_start')?.id ?? null
            }
            return getEventById('day4_start')?.id ?? null
        }

        if (nextDay === 5) {
            if (shouldHospitalize) {
                return getEventById('day5_hospital_check')?.id ?? getEventById('day5_start')?.id ?? null
            }
            return getEventById('day5_start')?.id ?? null
        }

        if (nextDay === 6) {
            if (shouldHospitalize) {
                return getEventById('day6_start_after_hospital')?.id ?? getEventById('day6_start')?.id ?? null
            }
            return getEventById('day6_start')?.id ?? null
        }

        if (nextDay >= 7) {
            return getEventById('day7_wakeup')?.id ?? getEventById('day7_start')?.id ?? null
        }

        // generic fallback
        return getEventById(`day${Math.min(nextDay, MAX_DAY)}_start`)?.id ?? null
    },
}))