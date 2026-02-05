import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TypingText from '../ui/TypingText'
import useSound from '../../hooks/useSound'
import { useGameStore } from '../../stores/gameStore'

/* --- INLINE SVG ICONS --- */
function TriangleAlert({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    )
}

function Gavel({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
            <path d="m16 16 6-6" />
            <path d="m8 8 6-6" />
            <path d="m9 7 8 8" />
            <path d="m21 11-8-8" />
        </svg>
    )
}

function Dices({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <rect width="12" height="12" x="2" y="10" rx="2" ry="2" />
            <path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6" />
            <path d="M6 18h.01" />
            <path d="M10 14h.01" />
            <path d="M15 6h.01" />
            <path d="M18 9h.01" />
        </svg>
    )
}

function Pencil({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    )
}

function Clock({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function BookOpen({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    )
}

function Brain({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
    )
}

function HeartPulse({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
        </svg>
    )
}

/**
 * EXAM SCREEN - ULTIMATE VERSION
 * Kết hợp Visuals hoành tráng + Logic chiến thuật sâu sắc.
 */

// Flavor Texts: Suy nghĩ của nhân vật trong lúc làm bài
const FLAVOR_TEXTS = {
    high_knowledge: [
        "Câu này mình đã ôn kỹ ở Day 4 rồi!",
        "Viết mỏi cả tay nhưng mà sướng!",
        "Trúng tủ! Thầy giáo đúng là cứu tinh.",
        "Kiến thức tuôn ra như suối...",
        "Cặp phạm trù này dễ ợt.",
    ],
    low_knowledge: [
        "Đề này tiếng Việt hay tiếng ngoài hành tinh vậy?",
        "Thôi chết, phần này hôm qua ngủ quên chưa đọc...",
        "Cắn bút nãy giờ chưa viết được chữ nào.",
        "Liếc bài đứa bên cạnh được không nhỉ?",
        "Khoanh bừa câu C vậy, C là chân ái.",
        "Cầu mong giám thị dễ tính..."
    ],
    high_stress: [
        "Tim đập nhanh quá, không thở nổi...",
        "Tay run quá, chữ viết như gà bới.",
        "Mình sắp xỉu rồi...",
        "Mọi người viết nhanh quá, mình không kịp mất!",
    ],
    cheat_success: [
        "Hú hồn, giám thị vừa đi qua...",
        "Chép được nguyên một đoạn dài, ngon!",
        "Cảm giác tội lỗi nhưng mà... điểm cao là được.",
    ],
    lucky_guess: [
        "Tổ tiên mách bảo là câu B!",
        "Thần linh ơi phù hộ con...",
        "Nhắm mắt chọn đại vậy.",
    ]
}

type Stage = 'intro' | 'decision' | 'working' | 'caught' | 'submission' | 'waiting'

// NOISE BG
const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`

export default function ExamScreen({ onFinished }: { onFinished?: () => void }) {
    // ===== Store =====
    const stats = useGameStore(s => s.stats)
    const flags = useGameStore(s => s.flags)
    const addFlag = useGameStore(s => s.addFlag)
    const updateStats = useGameStore(s => s.updateStats)
    const evaluateEnding = useGameStore(s => s.evaluateEnding)

    // ===== Local State =====
    const [stage, setStage] = useState<Stage>('intro')
    const [progress, setProgress] = useState(0)
    const [currentThought, setCurrentThought] = useState("")
    const [isCheatingActive, setIsCheatingActive] = useState(false)
    const [isLuckyGuessing, setIsLuckyGuessing] = useState(false)
    const [resultText, setResultText] = useState("")

    // Refs
    const progressInterval = useRef<number | null>(null)
    const thoughtInterval = useRef<number | null>(null)

    // Sound
    const { play, stop, playSfx } = useSound()

    // ===== PHASES LOGIC =====

    // 1. Init & Intro
    useEffect(() => {
        play('bgm_exam', 0.6, true) // Nhạc nền dồn dập

        // Hiệu ứng tim đập nếu stress cao
        if (stats.stress > 70) {
            const beat = setInterval(() => {
                playSfx('/assets/sounds/heartbeat.mp3', 0.3)
            }, 1000)
            return () => clearInterval(beat)
        }

        // Chuyển sang phase Decision sau intro
        const t = setTimeout(() => {
            setStage('decision')
        }, 4000)

        return () => {
            clearTimeout(t)
            stop()
            if (progressInterval.current) clearInterval(progressInterval.current)
            if (thoughtInterval.current) clearInterval(thoughtInterval.current)
        }
    }, [])

    // 2. Logic Decision (Phao / Khoanh bừa / Tự tin)
    const handleDecision = (type: 'cheat' | 'guess' | 'confident') => {
        if (type === 'cheat') {
            // 50/50 Bị bắt
            const caught = Math.random() < 0.5
            if (caught) {
                addFlag('cheat_caught') // Bị đình chỉ
                playSfx('/assets/sounds/siren.mp3', 1.0)
                setStage('caught')
                return
            } else {
                // Cheat trót lọt -> Điểm cao
                addFlag('cheat_success')
                updateStats({ knowledge: 45, stress: 20 }) // Bonus mạnh
                setIsCheatingActive(true)
                setResultText("Trót lọt! Chép được gần hết bài.")
                startExamSimulation()
            }
        } else if (type === 'guess') {
            // 50/50 May mắn
            const lucky = Math.random() < 0.5
            if (lucky) {
                addFlag('lucky_guess') // Good ending (Pass)
                addFlag('miracle_survivor')
                updateStats({ knowledge: 40 }) // Cộng điểm vừa đủ qua
                setResultText("Tổ tiên mách bảo! Khoanh đâu trúng đó.")
            } else {
                setResultText("Đen quá... Khoanh toàn câu sai.")
                // Không cộng điểm -> Trượt
            }
            setIsLuckyGuessing(true)
            startExamSimulation()
        } else {
            // Tự tin
            addFlag('integrity_bonus')
            updateStats({ stress: -15 }) // Giảm stress
            setResultText("Tự tin vào kiến thức đã ôn luyện.")
            startExamSimulation()
        }
    }

    // 3. Exam Simulation (Main Loop - Visuals)
    const startExamSimulation = () => {
        setStage('working')
        let p = 0
        const duration = 8000 // 8 giây mô phỏng
        const tick = 100

        progressInterval.current = window.setInterval(() => {
            p += (tick / duration) * 100
            if (p >= 100) {
                p = 100
                finishExam()
            }
            setProgress(p)
        }, tick)

        // Random thoughts loop
        const thoughtTick = setInterval(() => {
            updateFlavorText()
        }, 2500)
        thoughtInterval.current = thoughtTick

        // Initial thought
        updateFlavorText()
    }

    const updateFlavorText = () => {
        let pool = [...FLAVOR_TEXTS.low_knowledge]

        if (stats.knowledge > 60) pool = [...FLAVOR_TEXTS.high_knowledge]
        if (stats.stress > 80) pool = [...pool, ...FLAVOR_TEXTS.high_stress]
        if (isCheatingActive) pool = [...pool, ...FLAVOR_TEXTS.cheat_success]
        if (isLuckyGuessing) pool = [...pool, ...FLAVOR_TEXTS.lucky_guess]

        const randomText = pool[Math.floor(Math.random() * pool.length)]
        setCurrentThought(randomText)
    }

    // 4. Finish & Submit
    const finishExam = () => {
        if (progressInterval.current) clearInterval(progressInterval.current)
        if (thoughtInterval.current) clearInterval(thoughtInterval.current)

        setStage('submission')
        playSfx('/assets/sounds/bell.mp3') // Tiếng trống hết giờ

        // Tính toán chỉ số cuối cùng (Final Adjustments)
        let finalKnowledge = stats.knowledge

        // Logic Flag impacts
        if (flags.deep_understanding) finalKnowledge += 10
        if (flags.surface_learning) finalKnowledge -= 5
        if (flags.all_in_final_night) finalKnowledge -= 10 // Mệt quá
        if (flags.stomach_ache) finalKnowledge -= 15 // Đau bụng

        // Update stats thầm lặng để store tính ending
        updateStats({ knowledge: Math.max(0, Math.min(100, finalKnowledge - stats.knowledge)) })

        // Chuyển sang màn hình chờ kết quả
        setTimeout(() => {
            setStage('waiting')
            // Gọi store tính ending
            if (typeof evaluateEnding === 'function') {
                evaluateEnding()
            }
            // Delay 3s để tạo kịch tính rồi thoát
            setTimeout(() => {
                onFinished?.()
            }, 3000)
        }, 2000)
    }

    // ===== RENDER HELPERS =====

    // Hiệu ứng rung lắc màn hình nếu stress cao
    const shakeVariants = {
        idle: { x: 0 },
        shaking: { x: [-2, 2, -2, 2, 0], transition: { repeat: Infinity, duration: 0.5 } }
    }

    const isStressed = stats.stress > 75

    return (
        <motion.div
            className="fixed inset-0 z-50 bg-black text-white font-sans overflow-hidden flex flex-col items-center justify-center p-6"
            variants={isStressed ? shakeVariants : {}}
            animate={isStressed ? "shaking" : "idle"}
        >
            {/* Background Texture & Vignette */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: NOISE_BG }}
            />
            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80 pointer-events-none" />

            <AnimatePresence mode='wait'>

                {/* --- STAGE: INTRO --- */}
                {stage === 'intro' && (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                        transition={{ duration: 0.8 }}
                        className="text-center z-10"
                    >
                        <motion.div
                            initial={{ y: -50 }} animate={{ y: 0 }}
                            className="text-yellow-500 text-xl font-bold tracking-[0.5em] mb-4"
                        >
                            DAY 7
                        </motion.div>
                        <h1 className="text-6xl md:text-8xl font-black mb-6 text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                            PHÒNG THI
                        </h1>
                        <p className="text-xl text-neutral-400 max-w-md mx-auto">
                            Thời khắc định mệnh. Hãy hít thở sâu.
                        </p>
                    </motion.div>
                )}

                {/* --- STAGE: DECISION (CHIẾN THUẬT) --- */}
                {stage === 'decision' && (
                    <motion.div
                        key="decision"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="max-w-lg w-full bg-neutral-900 border border-white/20 p-8 rounded-2xl shadow-2xl z-10 relative overflow-hidden"
                    >
                        <h2 className="text-2xl font-bold text-center mb-6">CHIẾN THUẬT LÀM BÀI</h2>
                        <div className="space-y-4">

                            {/* OPTION 1: DÙNG PHAO (Chỉ hiện nếu có phao) */}
                            {flags.has_cheat_sheet && (
                                <button
                                    onClick={() => handleDecision('cheat')}
                                    className="w-full p-4 bg-red-900/40 border border-red-500 hover:bg-red-800/60 rounded-xl text-left group transition-colors flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold text-xl">😈</div>
                                    <div>
                                        <div className="font-bold text-red-300 group-hover:text-white text-lg">Dùng phao thi</div>
                                        <div className="text-xs text-neutral-400 mt-1">Rủi ro 50%: Bị đình chỉ hoặc Điểm cao.</div>
                                    </div>
                                </button>
                            )}

                            {/* OPTION 2: KHOANH BỪA (Hiện nếu kiến thức < 50) */}
                            {stats.knowledge < 50 && (
                                <button
                                    onClick={() => handleDecision('guess')}
                                    className="w-full p-4 bg-yellow-900/40 border border-yellow-500 hover:bg-yellow-800/60 rounded-xl text-left group transition-colors flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 font-bold text-xl">🎲</div>
                                    <div>
                                        <div className="font-bold text-yellow-300 group-hover:text-white text-lg">Khoanh bừa cầu may</div>
                                        <div className="text-xs text-neutral-400 mt-1">Rủi ro 50%: Qua môn vớt vát hoặc Trượt.</div>
                                    </div>
                                </button>
                            )}

                            {/* OPTION 3: TỰ TIN (Hiện nếu kiến thức >= 50) */}
                            {stats.knowledge >= 50 && (
                                <button
                                    onClick={() => handleDecision('confident')}
                                    className="w-full p-4 bg-blue-900/40 border border-blue-500 hover:bg-blue-800/60 rounded-xl text-left group transition-colors flex items-center gap-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xl">🧠</div>
                                    <div>
                                        <div className="font-bold text-blue-300 group-hover:text-white text-lg">Tự tin làm bài</div>
                                        <div className="text-xs text-neutral-400 mt-1">Dựa vào thực lực ôn tập ({Math.round(stats.knowledge)} điểm).</div>
                                    </div>
                                </button>
                            )}

                            {/* Fallback Warning if stuck (Should not happen if logic is correct) */}
                            {stats.knowledge < 50 && !flags.has_cheat_sheet && (
                                <div className="text-center text-xs text-neutral-500 mt-2">
                                    *Bạn không đủ kiến thức để tự tin, buộc phải chọn Khoanh bừa.
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* --- STAGE: CAUGHT (BAD ENDING TRIGGER) --- */}
                {stage === 'caught' && (
                    <motion.div
                        key="caught"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center z-20"
                    >
                        <motion.div
                            animate={{ rotate: [-5, 5, -5, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.2 }}
                            className="text-8xl mb-4"
                        >
                            🚨
                        </motion.div>
                        <h1 className="text-5xl font-black text-red-600 mb-4 bg-black px-4 py-2 inline-block">
                            BỊ BẮT QUẢ TANG!
                        </h1>
                        <p className="text-xl text-white">Giám thị đã lập biên bản. Môn học bị hủy.</p>

                        <div className="mt-8">
                            <button
                                onClick={() => {
                                    evaluateEnding()
                                    onFinished?.()
                                }}
                                className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-neutral-200"
                            >
                                Chấp nhận số phận
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* --- STAGE: WORKING (SIMULATION) --- */}
                {stage === 'working' && (
                    <motion.div
                        key="working"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl z-10"
                    >
                        {/* Status Header */}
                        <div className="flex justify-between items-end mb-6 px-2">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white/10 rounded-lg backdrop-blur">
                                    <Pencil className={`w-6 h-6 text-white ${progress < 100 ? 'animate-bounce' : ''}`} />
                                </div>
                                <div>
                                    <div className="text-xs text-neutral-400 uppercase tracking-wider">Trạng thái</div>
                                    <div className="font-bold text-lg">Đang làm bài...</div>
                                    <div className="text-xs text-blue-300 italic">{resultText}</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center justify-end gap-2 text-red-400 mb-1">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-mono font-bold text-xl">
                                        {Math.floor((100 - progress) * 0.9)}:00
                                    </span>
                                </div>
                                <div className="text-xs text-neutral-500">Thời gian còn lại</div>
                            </div>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="relative h-6 bg-neutral-800 rounded-full overflow-hidden border border-white/10 shadow-inner mb-8">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500"
                                style={{ width: `${progress}%` }}
                                transition={{ ease: "linear" }}
                            />
                            {/* Stripes overlay */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20" />
                        </div>

                        {/* Dynamic Thought Bubble */}
                        <div className="h-24 flex items-center justify-center">
                            <AnimatePresence mode='wait'>
                                <motion.div
                                    key={currentThought}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="bg-white text-black px-6 py-4 rounded-xl rounded-bl-none shadow-lg max-w-md text-center font-medium italic relative"
                                >
                                    "{currentThought}"
                                    {/* Triangle pointer */}
                                    <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white transform rotate-45" />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Stats Indicators (Subtle) */}
                        <div className="mt-12 flex justify-center gap-8 opacity-60">
                            <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-blue-400" />
                                <span className="text-xs">{stats.knowledge > 50 ? 'Kiến thức ổn' : 'Mất gốc'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <HeartPulse className="w-4 h-4 text-red-400" />
                                <span className="text-xs">{stats.stress > 50 ? 'Căng thẳng' : 'Bình tĩnh'}</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* --- STAGE: SUBMISSION --- */}
                {stage === 'submission' && (
                    <motion.div
                        key="submission"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center z-10"
                    >
                        <BookOpen className="w-20 h-20 mx-auto text-white mb-6" />
                        <h2 className="text-4xl font-bold mb-2">ĐÃ NỘP BÀI</h2>
                        <p className="text-neutral-400">Giám thị đang thu bài...</p>
                    </motion.div>
                )}

                {/* --- STAGE: WAITING RESULTS --- */}
                {stage === 'waiting' && (
                    <motion.div
                        key="waiting"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center z-10 max-w-md px-6"
                    >
                        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-8" />
                        <h3 className="text-2xl font-bold mb-4">Đang chấm điểm...</h3>
                        <div className="space-y-2 text-sm text-neutral-500 font-mono">
                            <TypingText text="Analyzing knowledge base..." speed={30} />
                            <TypingText text="Checking integrity flags..." speed={30} />
                            <TypingText text="Finalizing GPA..." speed={30} />
                        </div>
                    </motion.div>
                )}

            </AnimatePresence>
        </motion.div>
    )
}