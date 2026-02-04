import {create} from 'zustand'

export type TypingSpeed = 'fast' | 'normal' | 'slow'

type SettingsState = {
    soundOn: boolean
    volume: number // 0..1
    typingSpeed: TypingSpeed
    autoSave: boolean

    setSoundOn: (v: boolean) => void
    setVolume: (v: number) => void
    setTypingSpeed: (s: TypingSpeed) => void
    setAutoSave: (v: boolean) => void
    resetSettings: () => void
    loadFromStorage: () => void
}

const STORAGE_KEY = 'mua-on-thi-settings-v1'

const defaultState = {
    soundOn: true,
    volume: 0.8,
    typingSpeed: 'normal' as TypingSpeed,
    autoSave: true,
}

export const useSettingsStore = create<SettingsState>((set) => ({
    ...defaultState,
    setSoundOn: (v: boolean) => {
        set({ soundOn: v })
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const data = raw ? JSON.parse(raw) : {}
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, soundOn: v }))
        } catch {}
    },
    setVolume: (v: number) => {
        const vol = Math.max(0, Math.min(1, v))
        set({ volume: vol })
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const data = raw ? JSON.parse(raw) : {}
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, volume: vol }))
        } catch {}
    },
    setTypingSpeed: (s: TypingSpeed) => {
        set({ typingSpeed: s })
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const data = raw ? JSON.parse(raw) : {}
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, typingSpeed: s }))
        } catch {}
    },
    setAutoSave: (v: boolean) => {
        set({ autoSave: v })
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            const data = raw ? JSON.parse(raw) : {}
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, autoSave: v }))
        } catch {}
    },
    resetSettings: () => {
        set({ ...defaultState })
        try {
            localStorage.removeItem(STORAGE_KEY)
        } catch {}
    },
    loadFromStorage: () => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY)
            if (!raw) return
            const parsed = JSON.parse(raw)
            set({
                soundOn: typeof parsed.soundOn === 'boolean' ? parsed.soundOn : defaultState.soundOn,
                volume: typeof parsed.volume === 'number' ? parsed.volume : defaultState.volume,
                typingSpeed: parsed.typingSpeed ?? defaultState.typingSpeed,
                autoSave: typeof parsed.autoSave === 'boolean' ? parsed.autoSave : defaultState.autoSave,
            })
        } catch {}
    },
}))