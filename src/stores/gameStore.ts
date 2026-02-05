import { create } from 'zustand'
import type { Stats, Ending, GameState, GameEvent } from '../types/game.types'
import { EVENTS } from '../data/events'
import { ENDINGS } from '../data/endings'
import saveGameUtils from '../utils/saveGame'

/* ================= CONSTANTS ================= */

const MAX_DAY = 7
const EVENT_LIST: GameEvent[] = Object.values(EVENTS)

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

// Type definitions
type StoreState = GameState & {
    endings: Ending[]

    resetGame: () => void
    loadGame: () => boolean
    saveGame: () => void

    updateStats: (delta: Partial<Stats>) => void
    addFlag: (flag: string) => void
    removeFlag: (flag: string) => void

    applyChoice: (choiceId: string) => void
    nextDay: () => void

    evaluateEnding: () => void
    evaluateAchievements: () => void
    checkEnding: () => Ending | null

    loadStory: (story: any) => void
    setEvents: (events: GameEvent[]) => void
    makeChoice: (choiceId: string) => void
}

const INITIAL_STATS: Stats = {
    knowledge: 10,
    health: 80,
    stress: 0,
    consciousness: 100,
    sleepless_count: 0,
    money: 500000
}

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

    loadStory: () => {},
    setEvents: () => {},
    removeFlag: () => {},
    makeChoice: (choiceId) => get().applyChoice(choiceId),

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
            const isTired = state.stats.sleepless_count >= 1

            ;(Object.keys(delta) as Array<keyof Stats>).forEach(key => {
                let val = delta[key]
                if (val !== undefined) {
                    if (isTired) {
                        if (key === 'knowledge' && val > 0) val = Math.ceil(val * 0.5)
                        if (key === 'stress' && val > 0) val = Math.ceil(val * 1.25)
                    }
                    newStats[key] = clampStat(key, newStats[key] + val)
                }
            })
            return { stats: newStats }
        })
    },

    addFlag: (flag) => set(s => ({ flags: { ...s.flags, [flag]: true } })),

    applyChoice: (choiceId) => {
        const state = get()
        const event = getEventById(state.currentEventId)
        if (!event) return

        const choice = event.choices.find(c => c.id === choiceId)
        if (!choice) return

        if (choice.effects) {
            const { time: timeEffect, ...statsEffects } = choice.effects

            if (typeof timeEffect === 'number') {
                const [h, m] = state.time.split(':').map(Number)
                let newH = h + timeEffect
                let newTime = `${Math.min(24, newH).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
                if (newH >= 24) newTime = '24:00'
                set({ time: newTime })
            }

            get().updateStats(statsEffects)
        }

        if (choice.flags) {
            choice.flags.forEach(f => get().addFlag(f))
        }

        const historyEntry = {
            day: state.day,
            eventId: event.id,
            choiceId: choice.id,
            timestamp: Date.now()
        }
        set(s => ({ history: [...s.history, historyEntry] }))

        // 🟢 FIX: Xử lý đặc biệt cho midnight
        // if (choice.nextEvent && choice.nextEvent.includes('midnight')) {
        //     // Không làm gì cả - để App.tsx tự xử lý midnight screen
        //     // Chỉ lưu game và return, App sẽ tự chuyển screen
        //     get().saveGame()
        //     return
        // }

        if (choice.nextEvent) {
            const nextEv = getEventById(choice.nextEvent)
            if (nextEv) {
                set({
                    currentEventId: nextEv.id,
                    time: nextEv.time || '08:00'
                })
            } else {
                get().nextDay()
            }
        } else {
            get().nextDay()
        }

        get().saveGame()
    },

    nextDay: () => {
        const state = get()
        const next = state.day + 1

        // 🚑 HOSPITAL CHECK (Logic tập trung tại đây)
        // Nếu đã thức trắng >= 2 đêm HOẶC hết máu -> Vào viện
        if (state.stats.sleepless_count >= 2 || state.stats.health <= 0) {
            set({
                day: next, // Vẫn sang ngày mới (ngày nhập viện)
                time: '08:00',
                currentEventId: 'hospital_start'
            })
            get().saveGame()
            return
        }

        // Kiểm tra kết thúc game
        if (next > MAX_DAY) {
            get().evaluateEnding()
            get().saveGame()
            return
        }

        // Tìm event bắt đầu ngày mới
        const ev = findStartEvent(next)

        // 🟢 FIX: Luôn đảm bảo time không phải là 24:00 khi bắt đầu ngày mới
        const newTime = ev?.time && ev.time !== '24:00' ? ev.time : '08:00'

        set({
            day: next,
            time: newTime,
            currentEventId: ev?.id ?? `day${next}_start`,
        })

        get().saveGame()
    },

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
        set({ endingId: ending?.id ?? 'normal_end' })
        get().evaluateAchievements()
    },

    evaluateAchievements: () => {
        // ...
    }
}))