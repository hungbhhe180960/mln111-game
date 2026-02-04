import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaMoon, FaGamepad, FaBook, FaExclamationTriangle } from 'react-icons/fa'
import useSound from '../../hooks/useSound'

type Props = {
    sleeplessCount: number
    onSelect: (choiceId: 'mid_sleep' | 'mid_play' | 'mid_study') => void
    className?: string
    disabled?: boolean
}

/**
 * MidnightChoice
 *
 * Special screen for 00:00 choices:
 * - 🌑 Sleep
 * - 🎮 Play
 * - 📚 Study
 *
 * Shows night background, big clock, warnings when sleeplessCount === 1,
 * and previews effects for each option.
 *
 * Plays optional clock ticking sound (expects /assets/sounds/clock_tick.mp3 in public).
 */
export default function MidnightChoice({ sleeplessCount, onSelect, className = '', disabled = false }: Props) {
    const { play, stop } = useSound()

    useEffect(() => {
        // Try to play ticking sound; ignore if blocked
        play('/assets/sounds/clock_tick.mp3', 0.4)
        return () => {
            stop()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const warningActive = sleeplessCount === 1

    const cardBase =
        'relative bg-white/6 backdrop-blur-sm border border-white/10 rounded-xl p-4 md:p-5 text-left flex flex-col gap-3 shadow-md'

    return (
        <div className={`w-full h-full flex flex-col items-center justify-center ${className}`}>
            {/* starry night background accent */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-gradient-to-b from-[#020617]/80 to-[#041025]/90 pointer-events-none"
                aria-hidden
            >
                {/* simple animated stars using multiple radial gradients (CSS) */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage:
                            'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
                        backgroundSize: '60px 60px, 120px 120px',
                        backgroundPosition: '0 0, 30px 60px',
                        mixBlendMode: 'screen',
                        opacity: 0.85,
                        filter: 'blur(0.35px)',
                    }}
                />
            </motion.div>

            {/* Center clock */}
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`relative z-10 flex flex-col items-center gap-4`}
            >
                <div className="flex items-center gap-4">
                    <motion.div
                        animate={{ rotate: [0, 6, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                        className="text-4xl md:text-6xl text-white/90 select-none drop-shadow-lg"
                        aria-hidden
                    >
                        00:00
                    </motion.div>

                    {/* moon icon */}
                    <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 3.2 }}
                        className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center bg-white/6 border border-white/8 text-white/90"
                    >
                        <FaMoon className="text-2xl md:text-3xl" />
                    </motion.div>
                </div>

                {/* Warning if sleeplessCount === 1 */}
                {warningActive && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: [1, 1.02, 1] }}
                        transition={{ duration: 0.9, repeat: Infinity, repeatType: 'mirror' }}
                        className="mt-2 px-4 py-2 rounded-full bg-red-600/90 text-white font-semibold flex items-center gap-3 shadow-xl"
                    >
                        <motion.span
                            animate={{ rotate: [0, 8, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.6 }}
                            className="text-lg"
                        >
                            <FaExclamationTriangle />
                        </motion.span>
                        <span className="text-sm md:text-base">THỨC THÊM ĐÊM NỮA SẼ NHẬP VIỆN!</span>
                    </motion.div>
                )}
            </motion.div>

            {/* Choices container */}
            <div className={`z-20 mt-8 w-[92%] max-w-3xl ${warningActive ? 'border-2 border-red-400/40 rounded-xl p-1 animate-pulse-slow' : ''}`}>
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 ${warningActive ? 'animate-[pulse_2s_infinite]' : ''}`}>
                    {/* Sleep */}
                    <motion.button
                        whileHover={!disabled ? { scale: 1.02 } : {}}
                        whileTap={!disabled ? { scale: 0.98 } : {}}
                        onClick={() => !disabled && onSelect('mid_sleep')}
                        className={`${cardBase} hover:bg-white/8`}
                        aria-label="Đi ngủ"
                        disabled={disabled}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white text-2xl">
                                    <FaMoon />
                                </div>
                                <div>
                                    <div className="text-sm md:text-base font-semibold">🌑 Đi ngủ</div>
                                    <div className="text-xs text-neutral-300 mt-1">Đánh răng, ngủ đủ giấc.</div>
                                </div>
                            </div>

                            <div className="text-right text-xs text-neutral-300">
                                <div className="mb-1">+Health</div>
                                <div className="mb-1">Reset Sleepless</div>
                            </div>
                        </div>
                        <div className="mt-2 text-[13px] text-neutral-400">
                            Effect preview: Health +25, Stress -10, Sleepless reset.
                        </div>
                    </motion.button>

                    {/* Play */}
                    <motion.button
                        whileHover={!disabled ? { scale: 1.02 } : {}}
                        whileTap={!disabled ? { scale: 0.98 } : {}}
                        onClick={() => !disabled && onSelect('mid_play')}
                        className={`${cardBase} hover:bg-white/8`}
                        aria-label="Thức chơi"
                        disabled={disabled}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white text-2xl">
                                    <FaGamepad />
                                </div>
                                <div>
                                    <div className="text-sm md:text-base font-semibold">🎮 Thức chơi</div>
                                    <div className="text-xs text-neutral-300 mt-1">Một trận / vài tập giải trí.</div>
                                </div>
                            </div>

                            <div className="text-right text-xs text-neutral-300">
                                <div className="mb-1">-Money (if data)</div>
                                <div className="mb-1">-Health</div>
                            </div>
                        </div>
                        <div className="mt-2 text-[13px] text-neutral-400">
                            Effect preview: Stress -25, Health -20, Sleepless +1, Knowledge -3.
                        </div>
                    </motion.button>

                    {/* Study */}
                    <motion.button
                        whileHover={!disabled ? { scale: 1.02 } : {}}
                        whileTap={!disabled ? { scale: 0.98 } : {}}
                        onClick={() => !disabled && onSelect('mid_study')}
                        className={`${cardBase} hover:bg-white/8`}
                        aria-label="Thức học"
                        disabled={disabled}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-white text-2xl">
                                    <FaBook />
                                </div>
                                <div>
                                    <div className="text-sm md:text-base font-semibold">📚 Thức học</div>
                                    <div className="text-xs text-neutral-300 mt-1">Cày đêm, nạp thêm kiến thức.</div>
                                </div>
                            </div>

                            <div className="text-right text-xs text-neutral-300">
                                <div className="mb-1">+Knowledge</div>
                                <div className="mb-1">-Health</div>
                            </div>
                        </div>
                        <div className="mt-2 text-[13px] text-neutral-400">
                            Effect preview: Knowledge +18, Health -25, Stress +15, Sleepless +1, Consciousness +10.
                        </div>
                    </motion.button>
                </div>
            </div>
        </div>
    )
}