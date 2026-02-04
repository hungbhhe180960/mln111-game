import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { EVENTS } from '../../data/events'
import { useGameStore } from '../../stores/gameStore'
import StatsPanel from './StatsPanel'
import DialogBox from './DialogBox'
import ChoicesList from './ChoicesList'
import ScreenEffects from './ScreenEffects'
import type { Event as GameEvent } from '../../types/game.types'

export default function GameScreen() {
    // ===== Store bindings =====
    const day = useGameStore(s => s.day)
    const time = useGameStore(s => s.time)
    const stats = useGameStore(s => s.stats)
    const currentEventId = useGameStore(s => s.currentEventId)
    const applyChoice = useGameStore(s => s.applyChoice)

    // ===== Local UI state =====
    const [choicesVisible, setChoicesVisible] = useState(false)
    const [bgKey, setBgKey] = useState<string | null>(null)

    // ===== Resolve current event =====
    const currentEvent: GameEvent | null = useMemo(() => {
        if (!currentEventId) return null
        return (EVENTS as Record<string, GameEvent>)[currentEventId] ?? null
    }, [currentEventId])

    // ===== Filter Choices =====
    const availableChoices = useMemo(() => {
        if (!currentEvent?.choices) return []
        const currentState = useGameStore.getState()
        return currentEvent.choices.filter(choice => {
            if (!choice.condition) return true
            try {
                return choice.condition(currentState)
            } catch (e) {
                console.warn('Choice condition error', e)
                return false
            }
        })
    }, [currentEvent, stats])

    // ===== Background =====
    useEffect(() => {
        if (currentEvent?.bgImage) {
            setBgKey(currentEvent.bgImage)
        }
    }, [currentEvent])

    // ===== Handlers =====
    const handleNarrationComplete = () => {
        if (availableChoices.length > 0) {
            setChoicesVisible(true)
        }
    }

    const handleSelect = (choiceId: string) => {
        setChoicesVisible(false)
        setTimeout(() => {
            applyChoice(choiceId)
        }, 150)
    }

    // Reset visibility khi event đổi
    useEffect(() => {
        setChoicesVisible(false)
    }, [currentEventId])

    if (!currentEvent) {
        return <div className="flex items-center justify-center h-screen text-white">Loading Event...</div>
    }

    return (
        <div className="relative w-full h-full overflow-hidden flex flex-col">
            {/* 1. Background Layer (Fixed) */}
            <div className="absolute inset-0 z-0 bg-neutral-900 transition-colors duration-1000">
                <AnimatePresence mode='wait'>
                    {bgKey && (
                        <motion.img
                            key={bgKey}
                            src={bgKey}
                            alt="Background"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    )}
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
            </div>

            {/* 2. Effects Layer */}
            <ScreenEffects />

            {/* 3. Main Content Layer (Flex Column) */}
            <div className="relative z-10 w-full h-full flex flex-col px-4 safe-area-inset-bottom overflow-y-auto">

                {/* TOP: Stats Panel */}
                <div className="pt-4 flex justify-center w-full shrink-0">
                    <StatsPanel stats={stats} day={day} time={time} />
                </div>

                {/* MIDDLE: Spacer để đẩy nội dung xuống đáy */}
                <div className="flex-grow" />

                {/* BOTTOM: Choices + Dialog */}
                <div className="w-full max-w-4xl mx-auto pb-6">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentEvent.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.4 }}
                            className="flex flex-col justify-end"
                        >
                            {/* --- 1. OPTION LIST (Luôn nằm trên Dialog) --- */}
                            {/* mb-4 tạo khoảng cách an toàn với Dialog */}
                            <div className="mb-4 min-h-[80px] flex flex-col justify-end">
                                {choicesVisible && availableChoices.length > 0 && (
                                    <ChoicesList
                                        choices={availableChoices}
                                        onSelect={handleSelect}
                                    />
                                )}
                            </div>

                            {/* --- 2. DIALOG BOX (Luôn nằm dưới cùng) --- */}
                            <div className="shrink-0">
                                <DialogBox
                                    title={currentEvent.title}
                                    description={currentEvent.description ?? ''}
                                    narration={currentEvent.narration ?? ''}
                                    showSkip
                                    onSkipComplete={handleNarrationComplete}
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}