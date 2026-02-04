import { create } from 'zustand'
import type { Stats, Choice, GameEvent, Ending, GameState, Flags } from '../types/game.types'
import { EVENTS } from '../data/events'
import { ENDINGS } from '../data/endings'
import { ACHIEVEMENTS } from '../data/achievements'
import saveGameUtils from '../utils/saveGame'

/* ================= CONSTANTS ================= */

const MAX_DAY = 7
const EVENT_LIST: GameEvent[] = Object.values(EVENTS)

const INITIAL_STATS: Stats = {
    knowledge: 10,
    health: 80,
    stress: 0,
    consciousness: 100,
    sleepless_count: 0,
    money: 500000
}

/* ================= HELPERS ================= */

function getEventById(id?: string | null): GameEvent | null {
    if (!id) return null
    return EVENT_LIST.find(e => e.id === id) ?? null
}

function findStartEvent(day: number): GameEvent | null {
    return (
        EVENT_LIST.find(e => e.id === `day${day}_start`) ??
        EVENT_LIST.find(e => e.day === day) ??
        null
    )
}

function clampStat(key: keyof Stats, value: number) {
    if (key === 'money' || key === 'sleepless_count') {
        return Math.max(0, Math.round(value))
    }
    return Math.max(0, Math.min(100, Math.round(value)))
}

/**
 * Helper: Cộng thêm giờ vào chuỗi HH:mm
 * Nếu vượt quá 24:00 sẽ clamp lại ở 24:00 để trigger Midnight
 */
function addHours(currentTime: string, hoursToAdd: number): string {
    const [h, m] = currentTime.split(':').map(Number)
    let newH = h + hoursToAdd

    // Logic game: Nếu time >= 24 thì set cứng là 24:00 để App.tsx bắt sự kiện Midnight
    if (newH >= 24) return '24:00'

    return `${newH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

function buildGameState(get: () => StoreState): GameState {
    const s = get()
    return {
        day: s.day,
        time: s.time,
        stats: s.stats,
        flags: s.flags,
        currentEventId: s.currentEventId,
        endingId: s.endingId,
        history: s.history
    }
}

/* ================= STORE TYPES ================= */

type StoreState = GameState & {
    endings: Ending[]

    // Actions
    resetGame: () => void
    loadGame: () => boolean
    saveGame: () => void
    setEvents: (events: GameEvent[]) => void
    updateStats: (delta: Partial<Stats>) => void
    addFlag: (flag: string) => void
    removeFlag: (flag: string) => void

    applyChoice: (choiceId: string) => void
    nextDay: () => void

    evaluateEnding: () => void
    evaluateAchievements: () => void
    checkEnding: () => Ending | null
    loadStory: (story: any) => void

    // Internal helper for UI binding if needed
    makeChoice: (choiceId: string) => void
}

/* ================= STORE IMPLEMENTATION ================= */

export const useGameStore = create<StoreState>((set, get) => ({
    // State
    day: 1,
    time: '08:00',
    stats: { ...INITIAL_STATS },
    flags: {},
    currentEventId: 'day1_start',
    endingId: null,
    history: [],
    endings: ENDINGS,

    /* --- Actions --- */

    loadStory: () => {},
    setEvents: () => {},

    makeChoice: (choiceId) => {
        get().applyChoice(choiceId)
    },

    resetGame: () => {
        set({
            day: 1,
            time: '08:00',
            stats: { ...INITIAL_STATS },
            flags: {},
            currentEventId: 'day1_start',
            endingId: null,
            history: []
        })
        saveGameUtils.deleteSaveGame()
    },

    saveGame: () => {
        const s = get()
        saveGameUtils.saveGame({
            day: s.day,
            time: s.time,
            stats: s.stats,
            flags: s.flags,
            currentEventId: s.currentEventId,
            endingId: s.endingId,
            history: s.history
        })
    },

    loadGame: () => {
        const saved = saveGameUtils.loadGame()
        if (saved) {
            set({
                ...saved,
                stats: { ...INITIAL_STATS, ...saved.stats },
                flags: saved.flags || {}
            })
            return true
        }
        return false
    },

    updateStats: (delta) => {
        set(state => {
            const newStats = { ...state.stats }
            ;(Object.keys(delta) as Array<keyof Stats>).forEach(key => {
                const val = delta[key]
                if (val !== undefined) {
                    newStats[key] = clampStat(key, newStats[key] + val)
                }
            })
            return { stats: newStats }
        })
    },

    addFlag: (flag) => set(s => ({ flags: { ...s.flags, [flag]: true } })),
    removeFlag: (flag) => set(s => {
        const next = { ...s.flags }
        delete next[flag]
        return { flags: next }
    }),

    /* ========== CORE LOGIC: APPLY CHOICE ========== */

    applyChoice: (choiceId) => {
        const state = get()
        const event = getEventById(state.currentEventId)
        if (!event) return

        const choice = event.choices.find(c => c.id === choiceId)
        if (!choice) return

        // 1. Tách Time ra khỏi Stats Effects để xử lý riêng
        if (choice.effects) {
            const { time: timeEffect, ...statsEffects } = choice.effects

            // Xử lý Time (nếu có)
            if (typeof timeEffect === 'number') {
                const newTime = addHours(state.time, timeEffect)
                set({ time: newTime })
            }

            // Xử lý Stats còn lại
            get().updateStats(statsEffects)
        }

        // 2. Update flags
        if (choice.flags) {
            choice.flags.forEach(f => get().addFlag(f))
        }

        // 3. Save History
        const historyEntry = {
            day: state.day,
            eventId: event.id,
            choiceId: choice.id,
            timestamp: Date.now()
        }
        set(s => ({ history: [...s.history, historyEntry] }))

        // 4. Navigate Logic
        // Nếu time >= 24:00, App.tsx sẽ tự động chuyển sang Midnight screen,
        // nhưng ta vẫn cần update currentEventId nếu có nextEvent rõ ràng (cho history hoặc flow).
        // Tuy nhiên, ưu tiên logic: Time -> NextEvent.

        if (choice.nextEvent) {
            const nextEv = getEventById(choice.nextEvent)
            if (nextEv) {
                // Nếu event tiếp theo set lại giờ cứng (ví dụ sang Chiều 14:00), ta dùng giờ của event
                // Nếu không, giữ giờ hiện tại (đã cộng ở bước 1)

                // Logic: Các event mốc thời gian (Noon, Afternoon...) thường có time cố định.
                set({
                    currentEventId: nextEv.id,
                    time: nextEv.time // Set giờ theo event mới (Reset lại flow chuẩn)
                })
            } else {
                // Nếu nextEvent là string đặc biệt (như trigger midnight)
                if (choice.nextEvent.includes('midnight')) {
                    set({ time: '24:00' }) // Force midnight
                } else {
                    get().nextDay()
                }
            }
        } else {
            // Không có nextEvent -> coi như hết ngày
            get().nextDay()
        }

        // Auto save triggers via middleware/listener usually
        get().saveGame()
    },

    /* ========== MIDNIGHT / NEXT DAY ========== */

    nextDay: () => {
        const currentDay = get().day
        const next = currentDay + 1

        if (next > MAX_DAY) {
            get().evaluateEnding()
            return
        }

        const ev = findStartEvent(next)

        if (!ev) {
            console.error(`Missing start event for day ${next}`)
            get().evaluateEnding()
            return
        }

        set({
            day: next,
            time: ev.time, // Reset về 08:00 hoặc giờ của event start
            currentEventId: ev.id,
        })
    },

    /* ========== ENDING CHECK ========== */

    checkEnding: () => {
        const state = buildGameState(get)
        for (const end of ENDINGS) {
            try {
                if (end.condition(state)) return end
            } catch {}
        }
        return null
    },

    evaluateEnding: () => {
        const ending = get().checkEnding()
        if (ending) {
            set({ endingId: ending.id })
        } else {
            set({ endingId: 'normal_end' })
        }
        get().evaluateAchievements()
    },

    evaluateAchievements: () => {
        // Trigger check achievement (giả lập)
    }
}))