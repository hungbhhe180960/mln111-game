import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import TypingText from '../ui/TypingText'
import { GiBrain } from 'react-icons/gi'
import { AiOutlineHeart } from 'react-icons/ai'
import type { IconType } from 'react-icons'

type Props = {
    title: string
    description: string
    narration: string
    showSkip?: boolean
    onSkipComplete?: () => void
}

/**
 * DialogBox - Visual Novel style dialog at bottom of screen
 *
 * Features:
 * - Title shown immediately
 * - Description and Narration typed using TypingText sequentially
 * - Background blur + gradient overlay (glassmorphism)
 * - Avatar icon (brain / heart depending on context)
 * - Skip button (top-right) to reveal full text immediately
 * - Fade-in animation on mount
 */
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

    // decide icon heuristically from strings
    const Icon: IconType = useMemo(() => {
        const lc = `${title} ${description} ${narration}`.toLowerCase()
        if (lc.includes('crush') || lc.includes('yêu') || lc.includes('tán') || lc.includes('tim')) {
            return AiOutlineHeart
        }
        return GiBrain
    }, [title, description, narration])

    const handleSkip = useCallback(() => {
        if (skipped) return
        setSkipped(true)
        // call onSkipComplete once
        if (!skipFired) {
            setSkipFired(true)
            onSkipComplete?.()
        }
        // mark both sections done so full text is shown
        setDescDone(true)
        setNarrDone(true)
    }, [skipped, onSkipComplete, skipFired])

    const onDescComplete = useCallback(() => {
        setDescDone(true)
    }, [])
    const onNarrComplete = useCallback(() => {
        setNarrDone(true)
        // If user didn't press skip but finished typing, call onSkipComplete as completion callback.
        if (!skipFired) {
            setSkipFired(true)
            onSkipComplete?.()
        }
    }, [onSkipComplete, skipFired])

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.36, ease: 'easeOut' }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-3xl z-50"
        >
            <div className="relative">
                {/* Glass card */}
                <div className="backdrop-blur-md bg-gradient-to-r from-white/40 to-white/20 border border-white/20 rounded-2xl shadow-xl overflow-hidden">
                    {/* inner content padding */}
                    <div className="px-4 py-3 md:px-6 md:py-4">
                        <div className="flex items-start gap-4">
                            {/* avatar icon */}
                            <div className="shrink-0">
                                <div className="w-14 h-14 rounded-full bg-white/30 flex items-center justify-center text-2xl text-primary shadow-sm">
                                    <Icon />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                {/* Title */}
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm md:text-base font-semibold text-neutral-800">{title}</h3>

                                    {/* Skip button top-right */}
                                    {showSkip ? (
                                        <div className="ml-3">
                                            {!skipped && !(descDone && narrDone) ? (
                                                <button
                                                    onClick={handleSkip}
                                                    className="text-xs text-neutral-600 bg-white/30 px-2 py-1 rounded hover:bg-white/40 transition"
                                                >
                                                    Skip
                                                </button>
                                            ) : (
                                                <div className="text-xs text-neutral-400 select-none">Done</div>
                                            )}
                                        </div>
                                    ) : null}
                                </div>

                                {/* Description (typing) */}
                                <div className="mt-2">
                                    {!skipped ? (
                                        <TypingText
                                            key={`desc-${description}-${skipped ? 'skipped' : 'live'}`}
                                            text={description}
                                            speed={28}
                                            onComplete={onDescComplete}
                                            className="text-sm md:text-base text-neutral-700"
                                        />
                                    ) : (
                                        <p className="text-sm md:text-base text-neutral-700">{description}</p>
                                    )}
                                </div>

                                {/* small separator */}
                                <div className="h-2" />

                                {/* Narration — start typing only after description is done unless skipped */}
                                <div>
                                    {!skipped ? (
                                        descDone ? (
                                            <TypingText
                                                key={`narr-${narration}-${skipped ? 'skipped' : 'live'}`}
                                                text={narration}
                                                speed={26}
                                                onComplete={onNarrComplete}
                                                className="text-sm md:text-base text-neutral-800"
                                            />
                                        ) : (
                                            // placeholder small gap while description is typing
                                            <div className="h-4" />
                                        )
                                    ) : (
                                        <p className="text-sm md:text-base text-neutral-800">{narration}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* footer small hints */}
                        <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                            <div className="flex items-center gap-2">
                                <span className="inline-block w-2 h-2 rounded-full bg-primary/80" />
                                <span>Nhấn vào hộp thoại để skip từng đoạn</span>
                            </div>
                            <div>{/* You can place extra context info here if needed */}</div>
                        </div>
                    </div>
                </div>

                {/* gradient overlay accent (top-left) */}
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent to-white/5 mix-blend-overlay" />
            </div>
        </motion.div>
    )
}