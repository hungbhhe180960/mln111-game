import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/settingsStores'
import { useGameStore } from '../../stores/gameStore'
import useSound from '../../hooks/useSound'

type Props = {
    onStartNew?: () => void
    onContinue?: () => void
    onOpenSettings?: () => void
}

/**
 * MainMenu
 * - Load settings từ localStorage
 * - Phát nhạc nền nếu bật sound
 * - Cho phép New / Continue / Settings
 */
export default function MainMenu({
                                     onStartNew,
                                     onContinue,
                                     onOpenSettings,
                                 }: Props) {
    /* ================= settings ================= */
    const { soundOn, volume, loadFromStorage } = useSettingsStore()

    /* ================= game state ================= */
    const resetGame = useGameStore(s => s.resetGame)
    const loadGame = useGameStore(s => s.loadGame)

    /* ================= sound ================= */
    const { play, stop } = useSound()

    /* ================= check save ================= */
    const gameSaveExists = useMemo(() => {
        try {
            return Boolean(localStorage.getItem('mua-on-thi-save-v1'))
        } catch {
            return false
        }
    }, [])

    /* ================= effects ================= */
    useEffect(() => {
        // load settings once / when store changes
        loadFromStorage()

        if (soundOn) {
            try {
                play('/assets/sounds/bgm_main_theme.mp3', volume)
            } catch (err) {
                console.warn('Failed to play BGM:', err)
            }
        }

        return () => {
            stop()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [soundOn, volume])

    /* ================= handlers ================= */
    function handleNewGame() {
        resetGame()

        try {
            localStorage.removeItem('mua-on-thi-save-v1')
        } catch {}

        onStartNew?.()
    }

    function handleContinue() {
        loadGame()
        onContinue?.()
    }

    /* ================= render ================= */
    return (
        <div className="relative w-screen h-screen bg-gradient-to-br from-[#0f172a] to-[#020617] flex items-center justify-center overflow-hidden">
            {/* Animated background */}
            <motion.div
                aria-hidden
                animate={{ rotate: 360 }}
                transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                className="absolute -left-1/4 -top-1/4 w-[1000px] h-[1000px] rounded-full
                   bg-gradient-to-tr from-[#1e293b]/30 to-[#0ea5e9]/10 blur-3xl"
            />

            {/* Content */}
            <motion.div
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-2xl px-6 py-10 text-center"
            >
                {/* Title */}
                <div className="mb-6">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight">
                        Mùa ôn thi
                    </h1>
                    <p className="text-sm text-neutral-300 mt-2">
                        Visual Novel — 7 ngày quyết định
                    </p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewGame}
                        className="bg-primary text-black px-6 py-3 rounded-lg font-semibold shadow-lg"
                    >
                        Chơi mới
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: gameSaveExists ? 1.02 : 1 }}
                        whileTap={{ scale: gameSaveExists ? 0.98 : 1 }}
                        disabled={!gameSaveExists}
                        onClick={handleContinue}
                        className={`px-6 py-3 rounded-lg font-semibold transition
              ${
                            gameSaveExists
                                ? 'bg-white/10 text-white'
                                : 'bg-white/5 text-neutral-400 cursor-not-allowed'
                        }`}
                    >
                        Tiếp tục
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onOpenSettings}
                        className="px-6 py-3 rounded-lg font-medium bg-white/5 text-white"
                    >
                        Cài đặt
                    </motion.button>
                </div>

                <div className="mt-8 text-xs text-neutral-400">
                    Phiên bản demo — Dữ liệu lưu trong localStorage
                </div>
            </motion.div>
        </div>
    )
}
