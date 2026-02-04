/**
 * useSound - Sound manager hook using Howler.js
 *
 * Features:
 * - Play background music (looped)
 * - Play sound effects
 * - Crossfade between background tracks
 * - Volume control and mute toggle
 *
 * Notes:
 * - Requires `howler` package. Install with:
 *     npm install howler
 *
 * - It supports playing by logical key (from SOUND_MAP) or by direct URL path.
 * - This module uses a singleton SoundManager internally; the hook returns an API bound to it.
 */

import { useCallback, useEffect, useState } from 'react'
import { Howl, Howler } from 'howler'
import SOUND_MAP from '../data/sounds'

// --- Types exported by the hook
export type SoundAPI = {
    play: (keyOrUrl: string, volume?: number, loop?: boolean) => void
    playSfx: (keyOrUrl: string, volume?: number) => void
    stop: () => void
    stopBg: () => void
    crossfadeTo: (keyOrUrl: string, volume?: number, fadeMs?: number) => void
    setVolume: (v: number) => void // master volume 0..1
    mute: (flag?: boolean) => void
    isMuted: () => boolean
    getCurrentBgKey: () => string | null
}

// --- Internal manager singleton
class SoundManager {
    private bgHowl: Howl | null = null
    private bgKey: string | null = null
    private bgVolume = 1
    private sfxPool: Set<Howl> = new Set()
    private muted = false

    // Play either bg or sfx depending on loop flag; 'play' will route to bg when loop=true
    play(keyOrUrl: string, volume = 1, loop = false) {
        if (!keyOrUrl) return
        if (loop) {
            this.playBg(keyOrUrl, volume)
        } else {
            this.playSfx(keyOrUrl, volume)
        }
    }

    // Resolve key to url if mapped; otherwise treat as url
    private resolve(keyOrUrl: string) {
        if (!keyOrUrl) return keyOrUrl
        if (SOUND_MAP[keyOrUrl]) return SOUND_MAP[keyOrUrl]
        return keyOrUrl
    }

    // Play background music with crossfade when appropriate
    playBg(keyOrUrl: string, volume = 1, loop = true, fadeMs = 800) {
        const url = this.resolve(keyOrUrl)
        if (!url) return
        // If same track and playing, just adjust volume
        if (this.bgKey === keyOrUrl && this.bgHowl) {
            this.bgHowl.volume(this.muted ? 0 : volume * this.bgVolume)
            return
        }

        const newHowl = new Howl({
            src: [url],
            loop: loop,
            volume: 0, // start at 0 for fade-in
            html5: true,
        })

        // Start playing new track
        newHowl.play()

        // Crossfade from previous
        if (this.bgHowl) {
            try {
                const old = this.bgHowl
                const targetVol = this.muted ? 0 : volume * this.bgVolume
                // fade out old, fade in new
                old.fade(old.volume(), 0, fadeMs)
                newHowl.fade(0, targetVol, fadeMs)
                // after fade, stop and unload old
                setTimeout(() => {
                    try {
                        old.stop()
                        old.unload()
                    } catch {}
                }, fadeMs + 50)
            } catch (err) {
                // fallback: stop old immediately
                try {
                    this.bgHowl.stop()
                    this.bgHowl.unload()
                } catch {}
                newHowl.volume(this.muted ? 0 : volume * this.bgVolume)
            }
        } else {
            // no previous bg, just fade in
            const targetVol = this.muted ? 0 : volume * this.bgVolume
            newHowl.fade(0, targetVol, fadeMs)
        }

        this.bgHowl = newHowl
        this.bgKey = keyOrUrl
    }

    // crossfade explicitly
    crossfadeTo(keyOrUrl: string, volume = 1, fadeMs = 800) {
        this.playBg(keyOrUrl, volume, true, fadeMs)
    }

    // Stop background (fade out)
    stopBg(fadeMs = 400) {
        if (!this.bgHowl) return
        try {
            const old = this.bgHowl
            old.fade(old.volume(), 0, fadeMs)
            setTimeout(() => {
                try {
                    old.stop()
                    old.unload()
                } catch {}
            }, fadeMs + 50)
        } catch {
            try {
                this.bgHowl.stop()
                this.bgHowl.unload()
            } catch {}
        }
        this.bgHowl = null
        this.bgKey = null
    }

    // Stop everything immediately
    stopAll() {
        this.stopBg(0)
        for (const h of Array.from(this.sfxPool)) {
            try {
                h.stop()
                h.unload()
            } catch {}
        }
        this.sfxPool.clear()
    }

    // Play sfx (non-looping). We create a Howl, play and unload on end.
    playSfx(keyOrUrl: string, volume = 1) {
        const url = this.resolve(keyOrUrl)
        if (!url) return
        try {
            const h = new Howl({
                src: [url],
                volume: this.muted ? 0 : volume * this.bgVolume,
                loop: false,
                html5: true,
            })
            this.sfxPool.add(h)
            h.play()
            const cleanup = () => {
                try {
                    h.unload()
                } catch {}
                this.sfxPool.delete(h)
            }
            h.on('end', cleanup)
            h.on('stop', cleanup)
            // fallback cleanup after 30s
            setTimeout(cleanup, 30000)
        } catch (err) {
            // ignore
            // console.warn('playSfx error', err)
        }
    }

    // Set master volume 0..1 - affects existing bg and new sfx
    setVolume(v: number) {
        this.bgVolume = Math.max(0, Math.min(1, v))
        Howler.volume(this.muted ? 0 : this.bgVolume)
        if (this.bgHowl) {
            this.bgHowl.volume(this.muted ? 0 : this.bgVolume)
        }
    }

    // Mute/unmute
    mute(flag?: boolean) {
        if (typeof flag === 'boolean') {
            this.muted = flag
        } else {
            this.muted = !this.muted
        }
        Howler.mute(this.muted)
        // ensure bgHowl volume adjusted
        if (this.bgHowl) {
            this.bgHowl.volume(this.muted ? 0 : this.bgVolume)
        }
    }

    isMuted() {
        return this.muted
    }

    getCurrentBgKey() {
        return this.bgKey
    }
}

// singleton instance
const manager = new SoundManager()

// Hook wrapper returning stable functions
export default function useSound(): SoundAPI {
    // local state can mirror mute/volume for reactivity in components if desired
    const [muted, setMuted] = useState<boolean>(manager.isMuted())
    const [volume, setVol] = useState<number>(Howler.volume() ?? 1)

    useEffect(() => {
        // no-op, keep local state in sync if other parts call manager directly
        const iv = setInterval(() => {
            const isMutedNow = manager.isMuted()
            if (isMutedNow !== muted) setMuted(isMutedNow)
            const volNow = Howler.volume() ?? 1
            if (volNow !== volume) setVol(volNow)
        }, 250)
        return () => clearInterval(iv)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const play = useCallback((keyOrUrl: string, vol = 1, loop = false) => {
        if (!keyOrUrl) return
        if (loop) manager.playBg(keyOrUrl, vol, true)
        else manager.playSfx(keyOrUrl, vol)
    }, [])

    const playSfx = useCallback((keyOrUrl: string, vol = 1) => {
        manager.playSfx(keyOrUrl, vol)
    }, [])

    const stop = useCallback(() => {
        manager.stopAll()
    }, [])

    const stopBg = useCallback(() => {
        manager.stopBg()
    }, [])

    const crossfadeTo = useCallback((keyOrUrl: string, vol = 1, fadeMs = 800) => {
        manager.crossfadeTo(keyOrUrl, vol, fadeMs)
    }, [])

    const setVolume = useCallback((v: number) => {
        manager.setVolume(v)
        setVol(v)
    }, [])

    const mute = useCallback((flag?: boolean) => {
        manager.mute(flag)
        setMuted(manager.isMuted())
    }, [])

    const isMuted = useCallback(() => manager.isMuted(), [])

    const getCurrentBgKey = useCallback(() => manager.getCurrentBgKey(), [])

    return {
        play,
        playSfx,
        stop,
        stopBg,
        crossfadeTo,
        setVolume,
        mute,
        isMuted,
        getCurrentBgKey,
    }
}

/**
 * Optional: export manager for direct usage in non-react modules
 */
export { manager as SoundManager }