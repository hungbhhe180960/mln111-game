import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TypingText from '../ui/TypingText'
import useSound from '../../hooks/useSound'
import { useGameStore } from '../../stores/gameStore'
import type { Ending } from '../../types/game.types'
import { useAchievementStore } from '../../stores/achievementStore'
import AchievementBadge from '../ui/AchievementBadge'
import { FaRedo, FaShareAlt } from 'react-icons/fa'
import type { Achievement } from '../../data/achievements'

type Props = {
    ending: Ending
    onClose?: () => void
}

export default function EndingScreen({ ending, onClose }: Props) {
    /* =========================
       GAME STORE
       ========================= */
    const stats = useGameStore(s => s.stats)
    const history = useGameStore(s => s.history)
    const resetGame = useGameStore(s => s.resetGame)

    /* =========================
       ACHIEVEMENT STORE
       ========================= */
    const evaluateAchievements = useAchievementStore(s => s.evaluateAndUnlock)

    /* =========================
       STATE FOR NEW ACHIEVEMENTS
       ========================= */
    const [newAchievements, setNewAchievements] = useState<Achievement[]>([])

    /* =========================
       SOUND
       ========================= */
    const { stop } = useSound()

    useEffect(() => {
        stop()
    }, [ending, stop])

    /* =========================
       FIX: USE EFFECT INSTEAD OF USE MEMO FOR SIDE EFFECTS
       ========================= */
    useEffect(() => {
        const stateMock = useGameStore.getState()
        const unlocked = evaluateAchievements(stateMock)
        setNewAchievements(unlocked)
    }, [evaluateAchievements]) // Only runs once on mount

    const handleReplay = () => {
        resetGame()
        onClose?.()
    }

    const handleShare = () => {
        const text = `Tôi vừa đạt kết thúc "${ending.title}" trong game Mùa Ôn Thi! Knowledge: ${stats.knowledge}`
        if (navigator.share) {
            navigator.share({
                title: 'Mùa Ôn Thi - Kết quả',
                text: text,
                url: window.location.href,
            }).catch(() => {})
        } else {
            navigator.clipboard.writeText(text)
            alert('Đã copy kết quả vào clipboard!')
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-y-auto"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.2, type: 'spring' }}
                    className="max-w-2xl w-full bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                >
                    {/* Header Image / Color Bar */}
                    <div className="h-32 bg-gradient-to-r from-purple-900 to-indigo-900 relative flex items-center justify-center overflow-hidden">
                        {/* Safe Noise Pattern */}
                        <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                             style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}
                        />
                        <h1 className="relative z-10 text-3xl md:text-4xl font-bold text-white tracking-wider uppercase drop-shadow-md">
                            Kết Thúc
                        </h1>
                    </div>

                    <div className="p-6 md:p-8 space-y-6">
                        {/* Title & Desc */}
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-white mb-2">{ending.title}</h2>
                            <div className="text-neutral-400 leading-relaxed">
                                <TypingText text={ending.description ?? ''} speed={25} />
                            </div>
                        </div>

                        {/* Stats Summary */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Stat label="Kiến thức" value={stats.knowledge} color="text-blue-400" />
                            <Stat label="Sức khỏe" value={stats.health} color="text-red-400" />
                            <Stat label="Stress" value={stats.stress} color="text-purple-400" />
                            <Stat label="Tiền" value={`${(stats.money / 1000).toFixed(0)}k`} color="text-green-400" />
                        </div>

                        {/* New Achievements Unlocked */}
                        {newAchievements.length > 0 && (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                                <div className="text-yellow-500 text-xs font-bold uppercase tracking-widest mb-3">
                                    Thành tích mới mở khóa
                                </div>
                                <div className="space-y-2">
                                    {newAchievements.map(ach => (
                                        <AchievementBadge key={ach.id} achievement={ach} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="pt-6 border-t border-white/10">
                            <div className="text-center text-neutral-500 text-sm mb-4">
                                Bạn đã sống sót qua {history.length} sự kiện trong 7 ngày.
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button
                                    onClick={handleReplay}
                                    className="flex-1 bg-white hover:bg-neutral-200 text-black font-bold px-4 py-3 rounded-md flex items-center justify-center gap-2 transition-colors shadow-lg"
                                >
                                    <FaRedo /> Chơi lại
                                </button>

                                <button
                                    onClick={handleShare}
                                    className="px-6 py-3 rounded-md bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 transition-colors border border-white/10"
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
        <div className="p-3 bg-white/5 rounded text-center border border-white/5">
            <div className="text-xs text-neutral-400 mb-1 uppercase tracking-wide">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
        </div>
    )
}