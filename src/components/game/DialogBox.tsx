import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import TypingText from '../ui/TypingText'

/* --- INLINE SVG ICONS (Thay thế lucide-react/react-icons) --- */
function IconBrain({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
    )
}

function IconHeart({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
    )
}

function IconInfo({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
        </svg>
    )
}

function IconFastForward({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="13 19 22 12 13 5 13 19" />
            <polygon points="2 19 11 12 2 5 2 19" />
        </svg>
    )
}

type Props = {
    title: string
    description: string
    narration: string
    showSkip?: boolean
    onSkipComplete?: () => void
}

export default function DialogBox({
                                      title,
                                      description,
                                      narration,
                                      showSkip = false,
                                      onSkipComplete,
                                  }: Props) {
    const [descDone, setDescDone] = useState(false)
    const [narrDone, setNarrDone] = useState(false)
    const [skipped, setSkipped] = useState(false)
    const [skipFired, setSkipFired] = useState(false)

    // Icon heuristic
    const Icon = useMemo(() => {
        const t = (title + description).toLowerCase()
        if (t.includes('sức khỏe') || t.includes('bệnh') || t.includes('viện')) return IconHeart
        return IconBrain
    }, [title, description])

    // Reset state khi nội dung thay đổi
    useMemo(() => {
        setDescDone(false)
        setNarrDone(false)
        setSkipped(false)
        setSkipFired(false)
    }, [title, description, narration])

    const handleSkip = useCallback(() => {
        if (!showSkip) return
        setSkipped(true)
        setDescDone(true)
        setNarrDone(true)
        if (!skipFired) {
            setSkipFired(true)
            onSkipComplete?.()
        }
    }, [showSkip, onSkipComplete, skipFired])

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
        >
            {/* Hộp thoại chính - Tăng padding và kích thước */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-white/20 bg-neutral-900/95 backdrop-blur-xl shadow-2xl">

                {/* Header Bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                            <Icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide drop-shadow-md">
                                {title}
                            </h3>
                        </div>
                    </div>

                    {/* Nút BỎ QUA to, rõ ràng */}
                    {showSkip && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // Tránh click nhầm vào box
                                handleSkip();
                            }}
                            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/10 transition-all group"
                        >
                            <span className="text-sm font-bold uppercase tracking-wider group-hover:text-yellow-400">Bỏ qua</span>
                            <IconFastForward className="w-5 h-5 group-hover:text-yellow-400" />
                        </button>
                    )}
                </div>

                {/* Nội dung chính */}
                <div
                    onClick={handleSkip} // Vẫn cho phép click vào thân hộp để skip
                    className="p-6 md:p-8 min-h-[220px] flex flex-col justify-between cursor-pointer hover:bg-white/5 transition-colors"
                >
                    <div className="space-y-4">
                        {/* Description (Ngữ cảnh) */}
                        <div className="text-base md:text-lg font-medium text-indigo-300 italic">
                            {skipped ? (
                                description
                            ) : (
                                <TypingText
                                    text={description}
                                    speed={10} // Nhanh hơn chút
                                    onComplete={() => setDescDone(true)}
                                />
                            )}
                        </div>

                        {/* Narration (Lời dẫn) - CHỮ TO */}
                        <div className="min-h-[4rem]">
                            {(descDone || skipped) ? (
                                skipped ? (
                                    <p className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed font-light">
                                        {narration}
                                    </p>
                                ) : (
                                    <TypingText
                                        text={narration}
                                        speed={20}
                                        className="text-lg md:text-xl lg:text-2xl text-white leading-relaxed font-light"
                                        onComplete={() => {
                                            setNarrDone(true)
                                            if (!skipFired) {
                                                setSkipFired(true)
                                                onSkipComplete?.()
                                            }
                                        }}
                                    />
                                )
                            ) : (
                                <div className="h-8" />
                            )}
                        </div>
                    </div>

                    {/* Footer Hint */}
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center gap-2 text-neutral-400">
                        <IconInfo className="w-4 h-4" />
                        <span className="text-sm">Chạm vào hộp thoại để hiện hết chữ</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}