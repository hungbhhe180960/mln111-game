import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TypingText from '../ui/TypingText'
import useSound  from '../../hooks/useSound'
import { useGameStore } from '../../stores/gameStore'
import ENDINGS, { checkEnding } from '../../data/endings'
import EVENTS from '../../data/events'
import { AiOutlineCheck, AiOutlineQuestion, AiOutlineWarning } from 'react-icons/ai'
import { FaGavel, FaDice } from 'react-icons/fa'

/**
 * ExamScreen
 *
 * Implements Day 7 exam flow:
 *  - intro countdown with tick sound
 *  - branch by health/knowledge
 *  - Easy / Normal / Hard modes
 *
 * Uses zustand store (useGameStore) for stats and flags, and autosaves results.
 */

/* ---------- Helpers ---------- */

function clamp(v: number, min = 0, max = 100) {
    return Math.max(min, Math.min(max, v))
}

/**
 * calculateExamScore:
 * base score = knowledge / 10 + random(-1, +1)
 * modifiers via flags:
 *  - deep_understanding => +0.5
 *  - surface_learning => -0.5
 * final clamp 0..10, return number with one decimal
 */
function calculateExamScore(knowledge: number, flags: Record<string, boolean>) {
    const baseRand = (Math.random() * 2 - 1) // -1..+1
    let score = knowledge / 10 + baseRand
    if (flags.deep_understanding) score += 0.5
    if (flags.surface_learning || flags.surface_learning_2) score -= 0.5
    // cheat flags and miracle handling happen in gameplay branches, not here
    score = Math.max(0, Math.min(10, Math.round(score * 10) / 10))
    return score
}

/* ---------- Subscreens ---------- */

function CrashInExamScreen({ onResolve }: { onResolve?: () => void }) {
    // Very dramatic crash screen
    useEffect(() => {
        // ensure onResolve called maybe after some delay to allow store to show hospital flow
        const t = setTimeout(() => {
            onResolve?.()
        }, 2200)
        return () => clearTimeout(t)
    }, [onResolve])

    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <div className="max-w-2xl text-center bg-black/70 p-8 rounded-2xl text-white">
                <div className="text-3xl font-bold mb-2">Xe Cấp Cứu 115</div>
                <div className="text-lg mb-4">Bạn bị kiệt sức giữa phòng thi. Cấp cứu được gọi ngay lập tức.</div>
                <div className="text-sm text-neutral-300">Sức khỏe là vốn quý nhất — hãy chơi lại và chăm sóc bản thân.</div>
            </div>
        </div>
    )
}

function ExamEasyMode({
                          score,
                          onFinish,
                      }: {
    score: number
    onFinish?: (score: number) => void
}) {
    const [progress, setProgress] = useState(0) // 0..40
    useEffect(() => {
        let mounted = true
        const total = 40
        const interval = setInterval(() => {
            if (!mounted) return
            setProgress(p => {
                const next = p + Math.ceil(Math.random() * 3) // fast progress
                if (next >= total) {
                    clearInterval(interval)
                    setTimeout(() => onFinish?.(score), 600)
                    return total
                }
                return next
            })
        }, 60)
        return () => {
            mounted = false
            clearInterval(interval)
        }
    }, [onFinish, score])

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-6">
            <div className="text-2xl font-semibold text-green-200">Bạn làm rất tốt — Câu hỏi rơi đều vào tầm tay</div>
            <div className="grid grid-cols-10 gap-2 w-full max-w-3xl">
                {Array.from({ length: 40 }).map((_, i) => {
                    const done = i < progress
                    return (
                        <div
                            key={i}
                            className={`h-6 rounded-md flex items-center justify-center ${
                                done ? 'bg-green-500 text-white' : 'bg-white/10 text-neutral-300'
                            }`}
                        >
                            {done ? <AiOutlineCheck /> : <span className="text-xs">{i + 1}</span>}
                        </div>
                    )
                })}
            </div>
            <div className="text-lg text-white/90">Kết thúc bài thi... Điểm dự kiến: <strong>{score}</strong></div>
        </div>
    )
}

function ExamNormalMode({
                            score,
                            onFinish,
                        }: {
    score: number
    onFinish?: (score: number) => void
}) {
    const [progress, setProgress] = useState(0)
    useEffect(() => {
        let mounted = true
        const total = 40
        const interval = setInterval(() => {
            if (!mounted) return
            setProgress(p => {
                const next = p + (Math.random() < 0.6 ? 1 : 2) // moderate
                if (next >= total) {
                    clearInterval(interval)
                    setTimeout(() => onFinish?.(score), 900)
                    return total
                }
                return next
            })
        }, 120)
        return () => {
            mounted = false
            clearInterval(interval)
        }
    }, [score, onFinish])

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-6">
            <div className="text-2xl font-semibold text-amber-200">Bạn làm ổn — Có lúc phân vân nhưng qua được</div>
            <div className="grid grid-cols-10 gap-2 w-full max-w-3xl">
                {Array.from({ length: 40 }).map((_, i) => {
                    let cls = 'bg-white/10 text-neutral-300'
                    if (i < progress) {
                        // some of them are unsure
                        cls = i % 3 === 0 ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                    }
                    return (
                        <div key={i} className={`h-6 rounded-md flex items-center justify-center ${cls}`}>
                            {i < progress ? (i % 3 === 0 ? <AiOutlineQuestion /> : <AiOutlineCheck />) : <span className="text-xs">{i + 1}</span>}
                        </div>
                    )
                })}
            </div>
            <div className="text-lg text-white/90">Kết quả dự kiến: <strong>{score}</strong></div>
        </div>
    )
}

function ExamHardMode({
                          onResult,
                          hasCheat,
                          onUseCheat,
                      }: {
    onResult: (result: { caught?: boolean; score: number }) => void
    hasCheat: boolean
    onUseCheat: () => void
}) {
    const [stage, setStage] = useState<'present' | 'choice' | 'resolving' | 'done'>('present')
    const [outcome, setOutcome] = useState<{ caught?: boolean; score: number } | null>(null)

    useEffect(() => {
        const t = setTimeout(() => setStage('choice'), 800)
        return () => clearTimeout(t)
    }, [])

    function handleCheat() {
        setStage('resolving')
        // simulate detection 50/50
        const caught = Math.random() < 0.5
        const score = caught ? 0 : 4 + Math.random() * 1.5 // low pass if success
        setTimeout(() => {
            setOutcome({ caught, score: Math.round(score * 10) / 10 })
            setStage('done')
            onResult({ caught, score: Math.round(score * 10) / 10 })
        }, 900)
        onUseCheat()
    }

    function handleGuess() {
        setStage('resolving')
        const luck = Math.random() // chance influenced by flags could be passed in
        const score = luck < 0.35 ? 2 + Math.random() * 1.5 : 4 + Math.random() * 1.5
        setTimeout(() => {
            const final = Math.round(score * 10) / 10
            setOutcome({ score: final })
            setStage('done')
            onResult({ score: final })
        }, 800)
    }

    return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6 p-6">
            {stage === 'present' && <div className="text-2xl text-red-300">Không hiểu gì cả...</div>}

            {stage === 'choice' && (
                <div className="flex flex-col gap-4 items-center">
                    <div className="text-lg text-white/90">Bạn có hai lựa chọn:</div>
                    <div className="flex gap-4">
                        <button
                            onClick={handleCheat}
                            disabled={!hasCheat}
                            className={`px-4 py-2 rounded-md font-semibold ${hasCheat ? 'bg-yellow-500 text-black' : 'bg-white/6 text-neutral-400 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center gap-2"><FaGavel /> Gian lận</div>
                        </button>

                        <button onClick={handleGuess} className="px-4 py-2 rounded-md bg-white/8 text-white font-semibold">
                            <div className="flex items-center gap-2"><FaDice /> Khoanh bừa</div>
                        </button>
                    </div>
                </div>
            )}

            {stage === 'resolving' && <div className="text-white/80">Đang quyết định... <span className="inline-block animate-pulse">.</span></div>}

            {stage === 'done' && outcome && (
                <div className="text-center">
                    {outcome.caught ? (
                        <div className="text-red-400 text-lg font-bold">Bị bắt gian lận! Kết quả: Bị đình chỉ</div>
                    ) : (
                        <div className="text-green-300 text-lg font-semibold">Kết quả: {outcome.score} (tạm thời)</div>
                    )}
                </div>
            )}
        </div>
    )
}

/* ---------- Main Component ---------- */

export default function ExamScreen() {
    const stats = useGameStore(s => s.stats)
    const flags = useGameStore(s => s.flags)
    const addFlag = useGameStore(s => s.addFlag)
    const updateStats = useGameStore(s => s.updateStats)
    const saveGame = useGameStore(s => s.saveGame)
    const setEvents = useGameStore(s => s.setEvents)
    const setEndings = useGameStore(s => s.setEndings)

    const [countdown, setCountdown] = useState(5) // 5s countdown
    const [introDone, setIntroDone] = useState(false)
    const [mode, setMode] = useState<'easy' | 'normal' | 'hard' | null>(null)
    const [finalScore, setFinalScore] = useState<number | null>(null)
    const [cheatCaught, setCheatCaught] = useState<boolean | null>(null)

    const { play, stop } = useSound()

    useEffect(() => {
        // preload events/endings into store (if not already)
        setEvents(Object.values(EVENTS))
        setEndings(ENDINGS)
        // start ticking sound
        play('/assets/sounds/clock_tick.mp3', 0.35).catch(() => {})
        let mounted = true
        const t = setInterval(() => {
            setCountdown(c => {
                if (!mounted) return c
                if (c <= 1) {
                    clearInterval(t)
                    stop()
                    setIntroDone(true)
                    return 0
                }
                return c - 1
            })
        }, 1000)
        return () => {
            mounted = false
            clearInterval(t)
            stop()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Decide branch based on health/knowledge
    useEffect(() => {
        if (!introDone) return
        if (stats.health <= 0) {
            setMode('hard') // crash handled separately
            return
        }
        if (stats.knowledge > 80) setMode('easy')
        else if (stats.knowledge >= 50) setMode('normal')
        else setMode('hard')
    }, [introDone, stats.health, stats.knowledge])

    // compute base calculated score for easy/normal cases
    const preScore = useMemo(() => {
        return calculateExamScore(stats.knowledge, flags)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stats.knowledge, JSON.stringify(flags)])

    function handleFinish(score: number) {
        // store result: you could set flags for miracle or cheat outcomes here
        setFinalScore(score)
        // convert to internal consequences: adjust stress/health maybe
        // For simplicity, apply minor stress change based on score
        const stressDelta = score >= 8 ? -20 : score >= 5 ? 5 : 25
        updateStats({ stress: stressDelta })
        // autosave
        saveGame()
    }

    function handleHardResult(result: { caught?: boolean; score: number }) {
        if (result.caught) {
            // mark cheat caught flag and set score very low
            addFlag('cheat_caught')
            setCheatCaught(true)
            setFinalScore(0)
            // possible store effects (penalty)
            updateStats({ stress: 30 })
        } else {
            // success via cheat or lucky guess
            if (result.score >= 4 && result.score < 6) {
                addFlag('cheat_success')
            }
            setCheatCaught(false)
            setFinalScore(result.score)
            updateStats({ stress: -10 })
        }
        saveGame()
    }

    // Final resolution: after finalScore determined, check endings via store
    useEffect(() => {
        if (finalScore === null) return
        // Map finalScore into knowledge to reflect final assessment (not mandatory)
        // Here we keep stats.knowledge but endings use stats so optionally we can boost knowledge for evaluation.
        // We'll set a temporary knowledge bump proportional to finalScore for evaluation
        const mappedKnowledge = Math.round(finalScore * 10)
        updateStats({ knowledge: mappedKnowledge - stats.knowledge }) // delta
        // Autosave and then check endings
        saveGame()
        const ending = useGameStore.getState().checkEnding()
        if (ending) {
            // You might want to navigate to an Ending screen; for now we just log
            console.info('Ending triggered:', ending.id)
            // set a runtime flag to allow other components to transition
            addFlag(`ending_${ending.id}`)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [finalScore])

    // Crash handling
    if (stats.health <= 0) {
        return <CrashInExamScreen onResolve={() => {
            // move to hospital flow: set hospitalized flag & save; the store/hospital screen handles the rest
            addFlag('cheated_cause_crash') // optional
            useGameStore.getState().addFlag('hospitalized_day7')
            useGameStore.getState().saveGame()
        }} />
    }

    return (
        <div className="w-screen h-screen relative bg-[#060718] text-white overflow-hidden">
            {/* Background exam hall */}
            <motion.img
                src="/images/exam_hall.jpg"
                alt="exam hall"
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ scale: 1.02, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.9 }}
            />

            <div className="absolute inset-0 bg-black/50" />

            <div className="relative z-20 w-full h-full flex flex-col items-center justify-center p-6">
                {!introDone ? (
                    <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center max-w-2xl">
                        <div className="text-xl md:text-3xl font-bold mb-3">Phòng thi 101-A3</div>
                        <div className="mb-6">
                            <TypingText text={'Giám thị: "Các em chuẩn bị, 5 phút nữa phát đề!"'} speed={28} />
                        </div>

                        <div className="flex items-center gap-6 justify-center">
                            <div className="text-6xl font-mono">{countdown}</div>
                            <div className="text-sm text-neutral-200">Đếm ngược đến giờ phát đề</div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="w-full max-w-4xl">
                        {/* Camera zoom into paper */}
                        <motion.div initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }}>
                            {mode === 'easy' && finalScore == null && (
                                <ExamEasyMode score={preScore} onFinish={s => handleFinish(s)} />
                            )}

                            {mode === 'normal' && finalScore == null && (
                                <ExamNormalMode score={preScore} onFinish={s => handleFinish(s)} />
                            )}

                            {mode === 'hard' && finalScore == null && (
                                <ExamHardMode
                                    hasCheat={!!flags.has_cheat_sheet}
                                    onUseCheat={() => {
                                        // mark that player attempted cheat (flag)
                                        useGameStore.getState().addFlag('attempted_cheat')
                                    }}
                                    onResult={res => handleHardResult(res)}
                                />
                            )}

                            {finalScore !== null && (
                                <div className="mt-6 bg-black/50 p-6 rounded-lg text-center">
                                    <div className="text-2xl font-bold">Bài thi hoàn thành</div>
                                    <div className="text-lg mt-2">Điểm của bạn: <strong>{finalScore}</strong>/10</div>

                                    {cheatCaught ? (
                                        <div className="mt-4 text-red-400 font-semibold flex items-center justify-center gap-2">
                                            <AiOutlineWarning /> Bạn đã bị bắt gian lận — hậu quả nghiêm trọng.
                                        </div>
                                    ) : null}

                                    <div className="mt-6 flex justify-center gap-3">
                                        <button
                                            onClick={() => {
                                                // go to post exam event or ending flow
                                                useGameStore.getState().saveGame()
                                                const ending = useGameStore.getState().checkEnding()
                                                if (ending) {
                                                    // set event to post_exam or ending flow - keep simple: set flag
                                                    useGameStore.getState().addFlag(`ending_${ending.id}`)
                                                }
                                                // optionally navigate to post exam event:
                                                useGameStore.getState().setEvents(Object.values(EVENTS))
                                            }}
                                            className="px-4 py-2 rounded-md bg-primary text-white"
                                        >
                                            Xem kết quả (chờ email)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    )
}