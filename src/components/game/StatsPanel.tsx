import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GiBrain } from 'react-icons/gi'
import { AiFillHeart, AiOutlineWarning } from 'react-icons/ai'
import { FaBolt, FaBullseye, FaRegClock, FaMoneyBillWave } from 'react-icons/fa'
import StatsBar from '../ui/StatsBar'
import type { Stats } from '../../types/game.types'

type Props = {
    stats: Stats
    day: number
    time: string
    compact?: boolean
}

/**
 * Small utility hook to animate numeric transitions
 * from prev -> next using requestAnimationFrame.
 */
function useAnimatedNumber(value: number, duration = 500) {
    const [display, setDisplay] = useState<number>(value)
    const rafRef = useRef<number | null>(null)
    const startRef = useRef<number | null>(null)
    const fromRef = useRef<number>(value)

    useEffect(() => {
        // cancel previous
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        const from = fromRef.current
        const to = value
        if (from === to) {
            setDisplay(to)
            fromRef.current = to
            return
        }
        const startTime = performance.now()
        startRef.current = startTime

        function tick(now: number) {
            const elapsed = now - (startRef.current ?? now)
            const t = Math.min(1, elapsed / duration)
            // easeOutQuad
            const eased = 1 - (1 - t) * (1 - t)
            const current = from + (to - from) * eased
            setDisplay(Math.round(current))
            if (t < 1) {
                rafRef.current = requestAnimationFrame(tick)
            } else {
                fromRef.current = to
                rafRef.current = null
            }
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current)
                rafRef.current = null
            }
        }
    }, [value, duration])

    return display
}

export default function StatsPanel({ stats, day, time, compact = false }: Props) {
    const knowledgeAnim = useAnimatedNumber(stats.knowledge, 600)
    const healthAnim = useAnimatedNumber(stats.health, 600)
    const stressAnim = useAnimatedNumber(stats.stress, 600)
    const consciousnessAnim = useAnimatedNumber(stats.consciousness, 600)
    const moneyAnim = useAnimatedNumber(Math.round(stats.money / 1000), 600) // show in thousands for smoother anim

    const moneyFormatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    })

    const isHealthLow = stats.health < 30
    const isStressHigh = stats.stress > 80
    const hasSleepless = stats.sleepless_count >= 1

    return (
        <motion.aside
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36 }}
            className={`fixed z-50 transform ${
                compact ? 'left-1/2 -translate-x-1/2 top-4' : 'right-4 top-4'
            }`}
            aria-live="polite"
        >
            <div
                className={`w-[92vw] max-w-sm md:max-w-xs lg:max-w-md ${
                    compact ? 'px-2 py-2' : 'px-3 py-3'
                } backdrop-blur-md bg-white/30 border border-white/20 rounded-2xl shadow-xl`}
            >
                {/* Header: Day + Time + Money */}
                <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="text-xs md:text-sm text-neutral-700 font-semibold">
                                Ngày {day}
                            </div>
                            <div className="text-xs md:text-sm text-neutral-500 flex items-center gap-1">
                                <FaRegClock className="text-xs" />
                                <span>{time}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <div className="text-xs text-neutral-500">Tiền</div>
                            <div className="text-sm md:text-base font-semibold text-neutral-800 flex items-center gap-1">
                                <FaMoneyBillWave className="text-primary/90" />
                                <span>{moneyFormatter.format(Math.round(stats.money))}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats area */}
                <div className={`grid gap-2 ${compact ? 'grid-cols-4 items-center' : 'grid-cols-1'}`}>
                    {/* Knowledge */}
                    <div className={`${compact ? 'flex flex-col items-center' : ''}`}>
                        <div className={`flex items-center justify-between ${compact ? 'w-full' : 'mb-1'}`}>
                            <div className="flex items-center gap-2">
                                <GiBrain className="text-lg text-primary" />
                                {!compact && <div className="text-xs text-neutral-600">Knowledge</div>}
                            </div>
                            {/* animated number */}
                            {!compact && <div className="text-xs text-neutral-600">{knowledgeAnim}%</div>}
                        </div>
                        <div className={`${compact ? 'w-20 mt-1' : ''}`}>
                            <StatsBar value={stats.knowledge} icon={<GiBrain />} />
                        </div>
                    </div>

                    {/* Health */}
                    <div className={`${compact ? 'flex flex-col items-center' : ''}`}>
                        <div className={`flex items-center justify-between ${compact ? 'w-full' : 'mb-1'}`}>
                            <div className="flex items-center gap-2">
                                <AiFillHeart className="text-xl text-red-500" />
                                {!compact && <div className="text-xs text-neutral-600">Health</div>}
                            </div>
                            {!compact && <div className="text-xs text-neutral-600">{healthAnim}%</div>}
                        </div>

                        <div
                            className={`relative ${compact ? 'w-20 mt-1' : ''}`}
                        >
                            <StatsBar value={stats.health} icon={<AiFillHeart />} />
                            {/* Health warning: shake */}
                            <AnimatePresence>
                                {isHealthLow && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 0 }}
                                        animate={{ opacity: 1, x: [0, -4, 4, -3, 3, 0] }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 1.2, repeat: Infinity, repeatType: 'loop' }}
                                        className="absolute right-0 top-0 -translate-y-3"
                                        aria-hidden
                                    >
                                        <div className="flex items-center gap-1 bg-red-50/80 text-red-700 px-2 py-0.5 rounded-full text-xs shadow-sm">
                                            <AiOutlineWarning />
                                            <span>LOW</span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Stress */}
                    <div className={`${compact ? 'flex flex-col items-center' : ''}`}>
                        <div className={`flex items-center justify-between ${compact ? 'w-full' : 'mb-1'}`}>
                            <div className="flex items-center gap-2">
                                <FaBolt className="text-lg text-yellow-500" />
                                {!compact && <div className="text-xs text-neutral-600">Stress</div>}
                            </div>
                            {!compact && <div className="text-xs text-neutral-600">{stressAnim}%</div>}
                        </div>

                        <div className={`${compact ? 'w-20 mt-1' : ''}`}>
                            <motion.div
                                animate={isStressHigh ? { boxShadow: ['0 0 0 0 rgba(239,68,68,0.0)', '0 0 0 6px rgba(239,68,68,0.06)', '0 0 0 0 rgba(239,68,68,0)'] } : {}}
                                transition={isStressHigh ? { duration: 1.2, repeat: Infinity } : {}}
                            >
                                <StatsBar value={stats.stress} icon={<FaBolt />} />
                            </motion.div>
                        </div>
                    </div>

                    {/* Consciousness */}
                    <div className={`${compact ? 'flex flex-col items-center' : ''}`}>
                        <div className={`flex items-center justify-between ${compact ? 'w-full' : 'mb-1'}`}>
                            <div className="flex items-center gap-2">
                                <FaBullseye className="text-lg text-violet-600" />
                                {!compact && <div className="text-xs text-neutral-600">Consciousness</div>}
                            </div>
                            {!compact && <div className="text-xs text-neutral-600">{consciousnessAnim}%</div>}
                        </div>
                        <div className={`${compact ? 'w-20 mt-1' : ''}`}>
                            <StatsBar value={stats.consciousness} icon={<FaBullseye />} />
                        </div>
                    </div>
                </div>

                {/* Footer: sleepers and/help */}
                <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        {hasSleepless && (
                            <div className="group relative">
                                <div className="flex items-center gap-2 text-xs text-neutral-700 bg-yellow-50 px-2 py-1 rounded">
                                    <AiOutlineWarning className="text-yellow-600" />
                                    <span>⚠︎ {stats.sleepless_count} đêm thức</span>
                                </div>
                                <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-12 left-0 z-10 w-48 text-xs bg-black/80 text-white p-2 rounded">
                                    Thiếu ngủ làm giảm Consciousness và tăng rủi ro nhập viện.
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-neutral-500">Tip: Nhấn để xem chi tiết</div>
                </div>
            </div>
        </motion.aside>
    )
}