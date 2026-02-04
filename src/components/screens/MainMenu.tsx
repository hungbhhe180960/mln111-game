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
            return Boolean(localStorage.getItem('game_save'))
        } catch {
            return false
        }
    }, [])

    /* ================= effects ================= */
    useEffect(() => {
        loadFromStorage()
        if (soundOn) {
            play('bgm_main_theme', volume * 0.8, true)
        }
        return () => {
            stop()
        }
    }, [soundOn, volume, play, stop, loadFromStorage])

    const handleContinue = () => {
        if (!gameSaveExists) return
        onContinue?.()
    }

    return (
        <div className="relative w-full h-full overflow-hidden bg-neutral-900 text-white flex flex-col items-center justify-center p-6">
            {/* Background art (placeholder) */}
            <div className="absolute inset-0 z-0 opacity-40">
                <img
                    src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2604&auto=format&fit=crop"
                    alt="Background"
                    className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 flex flex-col items-center max-w-md w-full text-center"
            >
                <div className="mb-2 uppercase tracking-[0.2em] text-sm text-yellow-500 font-bold">Visual Novel Game</div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 drop-shadow-lg">
                    Mùa Ôn Thi
                </h1>
                <p className="text-neutral-300 mb-10 max-w-xs mx-auto leading-relaxed">
                    7 ngày cuối cùng trước kỳ thi định mệnh.
                    Bạn sẽ là thủ khoa, hay kẻ trượt môn?
                </p>

                <div className="flex flex-col gap-4 w-full max-w-xs">
                    {/* FIXED: High contrast button - White Background, Black Text */}
                    <motion.button
                        whileHover={{ scale: 1.02, backgroundColor: '#e5e5e5' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStartNew}
                        className="bg-white text-black px-6 py-4 rounded-lg font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all"
                    >
                        Chơi mới
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: gameSaveExists ? 1.02 : 1 }}
                        whileTap={{ scale: gameSaveExists ? 0.98 : 1 }}
                        disabled={!gameSaveExists}
                        onClick={handleContinue}
                        className={`px-6 py-3 rounded-lg font-semibold transition border
                        ${gameSaveExists
                            ? 'bg-neutral-800 border-neutral-600 text-white hover:bg-neutral-700'
                            : 'bg-transparent border-transparent text-neutral-600 cursor-not-allowed'
                        }`}
                    >
                        {gameSaveExists ? 'Tiếp tục' : 'Chưa có dữ liệu lưu'}
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onOpenSettings}
                        className="px-6 py-3 rounded-lg font-medium text-neutral-400 hover:text-white transition"
                    >
                        Cài đặt
                    </motion.button>
                </div>

                <div className="mt-12 text-[10px] text-neutral-600 uppercase tracking-widest">
                    Demo Version 1.0
                </div>
            </motion.div>
        </div>
    )
}