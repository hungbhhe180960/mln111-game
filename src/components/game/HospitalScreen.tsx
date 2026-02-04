import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TypingText from '../ui/TypingText'
import useSound from '../../hooks/useSound'
import { useGameStore } from '../../stores/gameStore'
import { FaAmbulance, FaHeartbeat } from 'react-icons/fa'

/**
 * HospitalScreen
 *
 * Sequence animation showing the player collapsing, being rushed to infirmary,
 * stats being adjusted, and consequences displayed.
 *
 * On confirm, it advances the flow to the appropriate "after hospital" event.
 *
 * Notes:
 * - Uses useGameStore.setState(...) to update currentEventId and flags after sequence.
 * - Persists changes via store.saveGame()
 */

type Props = {
    onContinue?: () => void
}

function useAnimatedNumber(value: number, duration = 800) {
    const [display, setDisplay] = useState(value)
    useEffect(() => {
        const start = performance.now()
        const from = display
        const to = value
        if (from === to) {
            setDisplay(to)
            return
        }
        let raf = 0
        function tick(now: number) {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
            const cur = Math.round(from + (to - from) * eased)
            setDisplay(cur)
            if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(raf)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])
    return display
}

export default function HospitalScreen({ onContinue }: Props) {
    const day = useGameStore(s => s.day)
    const stats = useGameStore(s => s.stats)
    const saveGame = useGameStore(s => s.saveGame)

    // For direct state writes (set currentEventId / flags)
    const setState = useGameStore.setState

    const { play, stop } = useSound()

    // sequence stages
    const [stage, setStage] = useState<
        'start' | 'thump' | 'emergency' | 'reveal' | 'doctor' | 'stats' | 'done'
    >('start')

    // compute target stat values for hospitalization effect
    const targetHealth = 50
    const targetKnowledge = Math.max(0, stats.knowledge - 10)
    const targetStress = Math.min(100, stats.stress + 25)
    const targetMoney = Math.max(0, stats.money - 100000)
    const targetSleepless = 0

    // animated displays
    const animatedHealth = useAnimatedNumber(stage === 'stats' ? targetHealth : stats.health, 900)
    const animatedKnowledge = useAnimatedNumber(stage === 'stats' ? targetKnowledge : stats.knowledge, 900)
    const animatedStress = useAnimatedNumber(stage === 'stats' ? targetStress : stats.stress, 900)
    const animatedMoney = useAnimatedNumber(stage === 'stats' ? targetMoney : stats.money, 900)

    // days left
    const daysLeft = Math.max(0, 7 - day)

    useEffect(() => {
        let mounted = true

        async function sequence() {
            if (!mounted) return
            // 1) Fade to black & thump
            setStage('thump')
            play('/assets/sounds/thump.mp3', 0.9)
            await new Promise(res => setTimeout(res, 900))

            setStage('emergency')
            stop()
            play('/assets/sounds/emergency_siren.mp3', 0.8)
            await new Promise(res => setTimeout(res, 1200))

            setStage('reveal')
            stop()
            play('/assets/sounds/hospital_ambience.mp3', 0.4)
            await new Promise(res => setTimeout(res, 700))

            if (!mounted) return
            setStage('doctor')
            await new Promise(res => setTimeout(res, 300))
            // leave doctor typing to onComplete -> transitions to stats stage
        }

        sequence()

        return () => {
            mounted = false
            stop()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // called when doctor narration typing completes -> animate stats and apply changes
    async function handleDoctorComplete() {
        setStage('stats')

        // animate durations handled by useAnimatedNumber
        // wait for animation
        await new Promise(res => setTimeout(res, 1000))

        // apply concrete changes to store (updateStats expects deltas)
        const delta = {
            health: targetHealth - stats.health,
            knowledge: targetKnowledge - stats.knowledge,
            stress: targetStress - stats.stress,
            money: targetMoney - stats.money,
            sleepless_count: -stats.sleepless_count,
        }

        useGameStore.getState().updateStats(delta)
        useGameStore.getState().addFlag(`hospitalized_day${day}`)
        // autosave
        saveGame()

        // move to done stage
        setStage('done')
    }

    function handleContinue() {
        // Advance to next day's start-after-hospital event if exists; otherwise next day start
        const nextDay = day + 1
        const afterEventId = `day${nextDay}_start_after_hospital`
        const fallbackEventId = `day${nextDay}_start`

        // set currentEventId using zustand setState
        // also ensure sleepless_count reset already applied
        const events = useGameStore.getState().events
        if (events && events[afterEventId]) {
            setState({ currentEventId: afterEventId, day: nextDay, time: '08:00' })
        } else {
            setState({ currentEventId: fallbackEventId, day: nextDay, time: '08:00' })
        }

        // persist save
        saveGame()

        onContinue?.()
    }

    // visual pieces
    const doctorLines = [
        "Bác sĩ: 'Bạn bị kiệt sức do thiếu ngủ/thiếu phục hồi. Chúng tôi cho truyền dịch và yêu cầu nghỉ tuyệt đối hôm nay.'",
        "Bác sĩ: 'Sức khoẻ sẽ ổn hơn, nhưng bạn mất một ngày ôn tập. Hãy ưu tiên phục hồi.'",
    ]

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black">
            {/* Fade to black overlay & transitions */}
            <AnimatePresence>
                {(stage === 'thump' || stage === 'emergency' || stage === 'reveal' || stage === 'doctor' || stage === 'stats' || stage === 'done') && (
                    <motion.div
                        key="hospital-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {/* Background: black -> hospital image */}
                        <div className="absolute inset-0">
                            {stage === 'thump' && <div className="w-full h-full bg-black" />}
                            {stage === 'emergency' && (
                                <div className="w-full h-full bg-gradient-to-b from-black via-red-900 to-black/90 animate-pulse" />
                            )}
                            {(stage === 'reveal' || stage === 'doctor' || stage === 'stats' || stage === 'done') && (
                                <motion.img
                                    src="/images/hospital_room.jpg"
                                    alt="hospital"
                                    initial={{ opacity: 0, scale: 1.03 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.9 }}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            {/* dark overlay for readability */}
                            <div className="absolute inset-0 bg-black/60" />
                        </div>

                        {/* Foreground panel */}
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.15, duration: 0.5 }}
                            className="relative z-20 max-w-3xl w-[92%] p-6 md:p-10 rounded-2xl bg-white/6 backdrop-blur-md border border-white/10 shadow-2xl"
                        >
                            {/* Dramatic header */}
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-600/80 flex items-center justify-center text-white text-xl">
                                    <FaAmbulance />
                                </div>
                                <div>
                                    <div className="text-lg md:text-xl font-bold text-white">Nhập viện khẩn cấp</div>
                                    <div className="text-sm text-neutral-200">Ngày {day} — Y tế can thiệp</div>
                                </div>
                            </div>

                            {/* Collapse text when thump */}
                            {stage === 'thump' && (
                                <div className="text-white text-center py-12">
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                                        <div className="text-2xl md:text-3xl font-semibold">Tối sầm mặt mũi...</div>
                                    </motion.div>
                                </div>
                            )}

                            {/* Doctor dialog */}
                            {(stage === 'doctor' || stage === 'stats' || stage === 'done') && (
                                <div>
                                    <div className="mb-3">
                                        <TypingText
                                            text={doctorLines.join(' ')}
                                            speed={28}
                                            onComplete={handleDoctorComplete}
                                            className="text-white text-base md:text-lg"
                                        />
                                    </div>

                                    {/* Stats animation / display */}
                                    <div className="grid grid-cols-2 gap-4 mt-6 text-white">
                                        <div className="bg-white/6 p-3 rounded-lg">
                                            <div className="text-xs text-neutral-300">Health</div>
                                            <div className="text-2xl font-semibold text-red-400 flex items-center gap-2">
                                                <FaHeartbeat /> {animatedHealth}
                                            </div>
                                        </div>

                                        <div className="bg-white/6 p-3 rounded-lg">
                                            <div className="text-xs text-neutral-300">Knowledge</div>
                                            <div className="text-2xl font-semibold text-amber-300">-{stats.knowledge - animatedKnowledge}</div>
                                            <div className="text-xs text-neutral-400 mt-1">Now: {animatedKnowledge}</div>
                                        </div>

                                        <div className="bg-white/6 p-3 rounded-lg">
                                            <div className="text-xs text-neutral-300">Stress</div>
                                            <div className="text-2xl font-semibold text-yellow-300">+{animatedStress - stats.stress}</div>
                                            <div className="text-xs text-neutral-400 mt-1">Now: {animatedStress}</div>
                                        </div>

                                        <div className="bg-white/6 p-3 rounded-lg">
                                            <div className="text-xs text-neutral-300">Money</div>
                                            <div className="text-2xl font-semibold text-green-300">-{Math.round((stats.money - animatedMoney) || 0)}</div>
                                            <div className="text-xs text-neutral-400 mt-1">Now: {animatedMoney}</div>
                                        </div>
                                    </div>

                                    {/* Consequences & countdown */}
                                    <div className="mt-6 bg-white/4 p-3 rounded-md">
                                        <div className="text-sm text-neutral-200">Consequences</div>
                                        <ul className="mt-2 text-neutral-100 list-disc pl-5 space-y-1">
                                            <li>SKIP toàn bộ ngày {day} (Bạn sẽ mất thời gian ôn luyện)</li>
                                            <li>Mất kiến thức tạm thời và tiền viện phí</li>
                                            <li>Countdown: Còn <strong>{daysLeft}</strong> ngày tới thi</li>
                                        </ul>
                                    </div>

                                    {/* Continue button */}
                                    {stage === 'done' ? (
                                        <div className="mt-6 flex justify-end">
                                            <motion.button
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={handleContinue}
                                                className="bg-primary text-white px-4 py-2 rounded-md font-medium"
                                            >
                                                Tiếp tục
                                            </motion.button>
                                        </div>
                                    ) : (
                                        <div className="mt-6 text-sm text-neutral-300 italic">Đang xử lý tình trạng y tế...</div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}