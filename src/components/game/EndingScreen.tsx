import { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TypingText from '../ui/TypingText'
import useSound from '../../hooks/useSound'
import { useGameStore } from '../../stores/gameStore'
import type { Ending } from '../../types/game.types'
import { useAchievementStore } from '../../stores/achievementStore'
import AchievementBadge from '../ui/AchievementBadge'
import { FaRedo, FaShareAlt } from 'react-icons/fa'

type Props = {
    ending: Ending
    onClose?: () => void
}

export default function EndingScreen({ ending, onClose }: Props) {
    /* =========================
       GAME STORE (SAFE SELECTORS)
       ========================= */
    const stats = useGameStore(s => s.stats)
    const history = useGameStore(s => s.history)
    const resetGame = useGameStore(s => s.resetGame)
    const saveGame = useGameStore(s => s.saveGame)

    /* =========================
       ACHIEVEMENT STORE (FIXED)
       ========================= */
    const loadAchievements = useAchievementStore(s => s.load)
    const evaluateAchievements = useAchievementStore(s => s.evaluateAndUnlock)
    const unlocked = useAchievementStore(s => s.unlocked) // ✅ FIX: no function call

    /* =========================
       SOUND
       ========================= */
    const { play, stop } = useSound()

    /* =========================
       BGM KEY (STABLE)
       ========================= */
    const bgmKey = useMemo(() => {
        if ((ending as any).bgMusic) return (ending as any).bgMusic as string

        switch (ending.id) {
            case 'best_ending':
                return 'epic_victory'
            case 'good_ending':
                return 'happy_theme'
            case 'miracle_ending':
                return 'calm_lucky'
            case 'neutral_ending':
                return 'calm_neutral'
            default:
                return 'sad_ominous'
        }
    }, [ending])

    /* =========================
       ON MOUNT
       ========================= */
    useEffect(() => {
        loadAchievements()
        evaluateAchievements(useGameStore.getState() as any)

        play(`/assets/sounds/${bgmKey}.mp3`, 0.6, true)

        return () => stop()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [bgmKey])

    /* =========================
       TIMELINE (STABLE)
       ========================= */
    const timeline = useMemo(() => {
        if (!history) return []
        return history.slice(-8)
    }, [history])

    /* =========================
       ACTIONS
       ========================= */
    function handleReplay() {
        stop()
        resetGame()
        saveGame()
        onClose?.()
    }

    function handleShare() {
        alert('Tính năng chia sẻ sẽ được bổ sung sau.')
    }

    /* =========================
       RENDER
       ========================= */
    return (
        <AnimatePresence>
            <motion.div
                key={ending.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 flex items-center justify-center bg-black text-white"
            >
                {/* Background */}
                {(ending as any).image ? (
                    <motion.img
                        src={(ending as any).image}
                        alt="ending"
                        className="absolute inset-0 w-full h-full object-cover"
                        initial={{ scale: 1.05, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.2 }}
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black/95" />
                )}

                <div className="absolute inset-0 bg-black/65" />

                <motion.div
                    initial={{ y: 24, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="relative z-20 max-w-5xl w-[94%] mx-auto p-6 md:p-10 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl"
                >
                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-4">
                        {ending.title}
                    </h1>

                    {/* Description */}
                    <TypingText
                        text={ending.description ?? ''}
                        speed={26}
                        className="text-center text-neutral-100 mb-6"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {/* Achievements */}
                        <div className="bg-white/6 p-4 rounded-lg">
                            <div className="text-sm text-neutral-300 mb-3">
                                Achievements unlocked
                            </div>
                            <div className="space-y-3">
                                {unlocked.length === 0 ? (
                                    <div className="text-xs text-neutral-400">
                                        Không có achievements.
                                    </div>
                                ) : (
                                    unlocked.map(a => (
                                        <AchievementBadge
                                            key={a.id}
                                            achievement={a}
                                        />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="bg-white/6 p-4 rounded-lg">
                            <div className="grid grid-cols-2 gap-3">
                                <Stat label="Knowledge" value={stats.knowledge} color="text-primary" />
                                <Stat label="Health" value={stats.health} color="text-red-400" />
                                <Stat label="Stress" value={stats.stress} color="text-yellow-300" />
                                <Stat
                                    label="Money"
                                    value={new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        maximumFractionDigits: 0,
                                    }).format(stats.money)}
                                    color="text-green-300"
                                />
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white/6 p-4 rounded-lg flex flex-col justify-between">
                            <div className="space-y-2">
                                {timeline.map((c, i) => (
                                    <div
                                        key={i}
                                        className="text-sm bg-white/5 p-2 rounded"
                                    >
                                        {c.text}
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={handleReplay}
                                    className="flex-1 bg-primary text-black px-4 py-2 rounded-md flex items-center justify-center gap-2"
                                >
                                    <FaRedo /> Chơi lại
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="px-4 py-2 rounded-md bg-white/6 flex items-center gap-2"
                                >
                                    <FaShareAlt /> Chia sẻ
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

/* =========================
   SMALL COMPONENT
   ========================= */
function Stat({
                  label,
                  value,
                  color,
              }: {
    label: string
    value: React.ReactNode
    color: string
}) {
    return (
        <div className="p-3 bg-white/5 rounded">
            <div className="text-xs text-neutral-300">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
        </div>
    )
}
