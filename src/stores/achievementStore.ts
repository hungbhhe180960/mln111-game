import {create} from 'zustand'
import type { Achievement } from '../data/achievements'
import { ACHIEVEMENTS } from '../data/achievements'
import type { GameState } from '../types/game.types'

const STORAGE_KEY = 'achievements_v1'

type AchievementState = {
    unlocked: string[]
    lastUnlocked?: Achievement | null
    queue: Achievement[] // pending to show toast
    // actions
    unlockById: (id: string) => void
    isUnlocked: (id: string) => boolean
    load: () => void
    save: () => void
    clear: () => void
    evaluateAndUnlock: (state: GameState) => Achievement[] // returns newly unlocked
    getUnlockedAchievements: () => Achievement[]
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
    unlocked: [],
    lastUnlocked: null,
    queue: [],

    unlockById: (id: string) => {
        const already = get().unlocked.includes(id)
        if (already) return
        const ach = ACHIEVEMENTS.find(a => a.id === id)
        if (!ach) return
        set(state => ({
            unlocked: [...state.unlocked, id],
            lastUnlocked: ach,
            queue: [...state.queue, ach],
        }))
        // persist
        get().save()
    },

    isUnlocked: (id: string) => {
        return get().unlocked.includes(id)
    },

    load: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (!raw) return
            const parsed = JSON.parse(raw) as { unlocked: string[] }
            if (parsed && Array.isArray(parsed.unlocked)) {
                set({ unlocked: parsed.unlocked })
            }
        } catch (err) {
            console.warn('achievement load error', err)
        }
    },

    save: () => {
        try {
            const state = get()
            const payload = { unlocked: state.unlocked }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        } catch (err) {
            console.warn('achievement save error', err)
        }
    },

    clear: () => {
        set({ unlocked: [], lastUnlocked: null, queue: [] })
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch {}
    },

    evaluateAndUnlock: (stateObj: GameState) => {
        const newly: Achievement[] = []
        ACHIEVEMENTS.forEach(a => {
            try {
                const cond = a.condition(stateObj)
                const already = get().unlocked.includes(a.id)
                if (cond && !already) {
                    set(s => ({ unlocked: [...s.unlocked, a.id], lastUnlocked: a, queue: [...s.queue, a] }))
                    newly.push(a)
                }
            } catch (err) {
                console.warn('achievement condition threw for', a.id, err)
            }
        })
        if (newly.length > 0) get().save()
        return newly
    },

    getUnlockedAchievements: () => {
        const ids = get().unlocked
        return ACHIEVEMENTS.filter(a => ids.includes(a.id))
    },
}))

export default useAchievementStore