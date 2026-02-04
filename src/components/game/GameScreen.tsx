import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EVENTS } from '../../data/events'
import { useGameStore } from '../../stores/gameStore'
import StatsPanel from './StatsPanel'
import DialogBox from './DialogBox'
import ChoicesList from './ChoicesList'
import type { Event as GameEvent, Choice } from '../../types/game.types'

export default function GameScreen() {
    // ===== Store bindings =====
    const day = useGameStore(s => s.day)
    const time = useGameStore(s => s.time)
    const stats = useGameStore(s => s.stats)
    const flags = useGameStore(s => s.flags)
    const currentEventId = useGameStore(s => s.currentEventId)
    const applyChoice = useGameStore(s => s.applyChoice)

    // ===== Local UI state =====
    const [choicesVisible, setChoicesVisible] = useState(false)
    const [transitioning, setTransitioning] = useState(false)
    const [bgKey, setBgKey] = useState<string | null>(null)

    // ===== Resolve current event =====
    const currentEvent: GameEvent | null = useMemo(() => {
        if (!currentEventId) return null
        return (EVENTS as Record<string, GameEvent>)[currentEventId] ?? null
    }, [currentEventId])

    // ===== Background crossfade =====
    useEffect(() => {
        const bg = currentEvent?.bgImage ?? null
        setBgKey(prev => (prev === bg ? prev : bg))
    }, [currentEvent?.bgImage])

    // ===== Handlers =====
    function handleNarrationComplete() {
        setTimeout(() => setChoicesVisible(true), 120)
    }

    async function handleSelect(choiceId: string) {
        if (!currentEvent) return

        setTransitioning(true)
        setChoicesVisible(false)

        await new Promise(res => setTimeout(res, 200))

        try {
            applyChoice(choiceId)
        } catch (err) {
            console.warn('applyChoice failed', err)
        }

        setTimeout(() => {
            setTransitioning(false)
        }, 220)
    }

    // ===== Visual effects =====
    const isHealthLow = stats.health < 30
    const isStressHigh = stats.stress > 80
    const hasSleepless = stats.sleepless_count >= 1

    const vignette = isStressHigh
    const blurBg = hasSleepless

    const bgImageSrc =
        currentEvent?.bgImage ?? '/images/bg_default.jpg'

    // ===== Render =====
    return (
        <div className="w-screen h-screen relative bg-neutral-800 text-neutral-900 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={bgImageSrc}
                        src={bgImageSrc}
                        alt="background"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className={`w-full h-full object-cover ${blurBg ? 'blur-sm' : ''}`}
                    />
                </AnimatePresence>

                <div className={`absolute inset-0 ${transitioning ? 'bg-black/30' : 'bg-black/20'}`} />

                {vignette && (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_40%,rgba(0,0,0,0.45)_100%)]" />
                )}
            </div>

            <motion.div
                animate={isHealthLow ? { x: [0, -4, 3, -3, 2, 0] } : { x: 0 }}
                transition={{ duration: 0.8, repeat: isHealthLow ? Infinity : 0 }}
                className="relative w-full h-full"
            >
                <StatsPanel stats={stats} day={day} time={time} />

                <div className="absolute inset-0 flex items-end justify-center pb-28 px-4">
                    <div className="w-full max-w-4xl">
                        <AnimatePresence mode="popLayout">
                            {!transitioning && currentEvent && (
                                <motion.div
                                    key={currentEvent.id}
                                    initial={{ opacity: 0, y: 14 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                >
                                    <DialogBox
                                        title={currentEvent.title}
                                        description={currentEvent.description ?? ''}
                                        narration={currentEvent.narration ?? ''}
                                        showSkip
                                        onSkipComplete={handleNarrationComplete}
                                    />

                                    <div className="mt-6">
                                        {choicesVisible && currentEvent.choices?.length > 0 && (
                                            <ChoicesList
                                                choices={currentEvent.choices as Choice[]}
                                                onSelect={handleSelect}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
