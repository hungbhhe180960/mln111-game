import React, { useEffect, useState, useCallback } from 'react'
import MainMenu from './components/screens/MainMenu'
import GameScreen from './components/game/GameScreen'
import MidnightChoice from './components/game/MidnightChoice'
import HospitalScreen from './components/game/HospitalScreen'
import ExamScreen from './components/game/ExamScreen'
import EndingScreen from './components/game/EndingScreen'
import PauseMenu from './components/screens/PauseMenu'
import SettingsScreen from './components/screens/SettingsScreen'
import { useGameStore } from './stores/gameStore'
import type { Ending } from './types/game.types'
import { AnimatePresence } from 'framer-motion'
import AchievementToast from './components/ui/AchievementToast'

type Screen =
    | 'menu'
    | 'game'
    | 'settings'
    | 'ending'
    | 'hospital'
    | 'exam'
    | 'midnight'

export default function App() {
    const [currentScreen, setCurrentScreen] = useState<Screen>('menu')
    const [isPaused, setIsPaused] = useState(false)
    const [showSettingsFromPause, setShowSettingsFromPause] = useState(false)

    // ===== Store selectors =====
    const day = useGameStore(s => s.day)
    const time = useGameStore(s => s.time)
    const stats = useGameStore(s => s.stats)
    const endingId = useGameStore(s => s.endingId)
    const endings = useGameStore(s => s.endings)

    // Actions
    const nextDay = useGameStore(s => s.nextDay)
    const updateStats = useGameStore(s => s.updateStats)
    const addFlag = useGameStore(s => s.addFlag)
    const loadGame = useGameStore(s => s.loadGame)

    // ===== Screen Routing Logic (Core Game Loop) =====
    useEffect(() => {
        if (currentScreen === 'menu' || currentScreen === 'settings') return

        // 1. Ending Check
        if (endingId) {
            setCurrentScreen('ending')
            return
        }

        // 2. Hospital Check (Máu <= 0 hoặc Thức >= 2 đêm)
        // Lưu ý: Logic ending cũng check cái này, nhưng ở đây check để hiện màn hình Hospital (nếu muốn hồi sức)
        // Trong game này, Hospital dẫn thẳng tới bad ending nên logic endingId ở trên sẽ bắt trước.
        // Tuy nhiên nếu bạn muốn Hospital là 1 sự kiện hồi phục (mất tiền/ngày), thì giữ lại.
        // Hiện tại: Hospital -> Bad Ending.

        // 3. Exam Check (Day 7 - 08:30)
        // Events.ts day7_enter cộng 30p -> 08:30
        if (day === 7 && time === '08:30') {
            setCurrentScreen('exam')
            return
        }

        // 4. Midnight Check
        if (time === '24:00' || time === '00:00') {
            setCurrentScreen('midnight')
            return
        }

        // 5. Default
        setCurrentScreen('game')

    }, [day, time, stats.health, endingId, currentScreen])

    // ... (Phần còn lại giữ nguyên như cũ)

    const handleStartNew = () => {
        useGameStore.getState().resetGame()
        setCurrentScreen('game')
    }

    const handleContinue = () => {
        const success = loadGame()
        if (success) {
            // Router sẽ tự nhảy
        }
    }

    const handleMidnightSelect = useCallback((choiceId: 'mid_sleep' | 'mid_play' | 'mid_study') => {
        const currentStats = useGameStore.getState().stats
        let dKnowledge = 0
        let dHealth = 0
        let dStress = 0
        let dSleepless = 0
        let dConsciousness = 0

        if (choiceId === 'mid_sleep') {
            dHealth = 20
            dStress = -20
            dConsciousness = 20
            // Reset sleepless
            dSleepless = -10
        } else if (choiceId === 'mid_play') {
            dHealth = -10
            dStress = -25
            dKnowledge = -2
            dSleepless = 1
            dConsciousness = -10
            addFlag('night_owl_pattern')
        } else if (choiceId === 'mid_study') {
            dKnowledge = 18
            dHealth = -25
            dStress = 15
            dSleepless = 1
            dConsciousness = -10
            addFlag('grinder_pattern')
        }

        updateStats({
            knowledge: dKnowledge,
            health: dHealth,
            stress: dStress,
            sleepless_count: dSleepless,
            consciousness: dConsciousness
        })
        nextDay()
    }, [nextDay, updateStats, addFlag])

    const handleHospitalContinue = () => {
        setCurrentScreen('game')
    }

    const handleExamFinished = () => {
        // Logic handled in ExamScreen via store ending
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && currentScreen === 'game') {
                setIsPaused(p => !p)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentScreen])

    return (
        <div className="relative w-full h-full overflow-hidden bg-black text-white font-sans select-none">
            <AchievementToast />

            {currentScreen === 'menu' && (
                <MainMenu
                    onStartNew={handleStartNew}
                    onContinue={handleContinue}
                    onOpenSettings={() => setCurrentScreen('settings')}
                />
            )}

            {currentScreen === 'game' && <GameScreen />}

            {currentScreen === 'midnight' && (
                <MidnightChoice
                    sleeplessCount={stats.sleepless_count}
                    onSelect={handleMidnightSelect}
                />
            )}

            {currentScreen === 'hospital' && (
                <HospitalScreen onContinue={handleHospitalContinue} />
            )}

            {currentScreen === 'exam' && (
                <ExamScreen onFinished={handleExamFinished} />
            )}

            {currentScreen === 'ending' && (
                <EndingScreen
                    ending={endings.find(e => e.id === endingId) as Ending}
                    onClose={() => setCurrentScreen('menu')}
                />
            )}

            {currentScreen === 'settings' && (
                <SettingsScreen onClose={() => setCurrentScreen('menu')} />
            )}

            <AnimatePresence>
                {isPaused && (
                    <PauseMenu
                        open={isPaused}
                        onClose={() => setIsPaused(false)}
                        onOpenSettings={() => setShowSettingsFromPause(true)}
                        onQuitToMenu={() => {
                            setIsPaused(false)
                            setCurrentScreen('menu')
                        }}
                    />
                )}
            </AnimatePresence>

            {showSettingsFromPause && (
                <div className="fixed inset-0 z-[70]">
                    <SettingsScreen onClose={() => setShowSettingsFromPause(false)} />
                </div>
            )}
        </div>
    )
}