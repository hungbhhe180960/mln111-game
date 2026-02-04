import React, { useEffect, useState } from 'react'
import MainMenu from './components/screens/MainMenu'
import GameScreen from './components/game/GameScreen'
import MidnightChoice from './components/game/MidnightChoice'
import HospitalScreen from './components/game/HospitalScreen'
import ExamScreen from './components/game/ExamScreen'
import EndingScreen from './components/game/EndingScreen'
import { useGameStore } from './stores/gameStore'
import type { Ending } from './types/game.types'

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
    const [currentEnding, setCurrentEnding] = useState<Ending | null>(null)

    // ===== Store selectors =====
    const day = useGameStore(s => s.day)
    const time = useGameStore(s => s.time)
    const stats = useGameStore(s => s.stats)
    const flags = useGameStore(s => s.flags)
    const currentEventId = useGameStore(s => s.currentEventId)

    const endingId = useGameStore(s => s.endingId)
    const endings = useGameStore(s => s.endings)

    const makeChoice = useGameStore(s => s.makeChoice)
    const loadGame = useGameStore(s => s.loadGame)

    // ===== Screen routing logic (IN-GAME) =====
    useEffect(() => {
        if (currentScreen !== 'game') return

        // 🔴 Ending luôn ưu tiên cao nhất
        if (endingId) {
            setCurrentScreen('ending')
            return
        }

        // 🏥 Hospital
        if (stats.sleepless_count >= 2 || stats.health <= 0) {
            setCurrentScreen('hospital')
            return
        }

        // 🌙 Midnight
        if (
            time === '00:00' ||
            (currentEventId && currentEventId.includes('midnight'))
        ) {
            setCurrentScreen('midnight')
            return
        }

        // 📝 Exam
        if (day >= 7 && currentEventId?.includes('exam')) {
            setCurrentScreen('exam')
            return
        }
    }, [currentScreen, day, time, stats, flags, currentEventId, endingId])

    // ===== Ending detection (GLOBAL – FIXED) =====
    useEffect(() => {
        if (!endingId) return
        if (!endings) return

        const ending = endings[endingId] ?? null
        if (!ending) {
            console.error('[APP] Ending not found:', endingId)
            return
        }

        setCurrentEnding(ending)
        setCurrentScreen('ending')
    }, [endingId, endings])

    // ===== Menu handlers =====
    function handleStartNew() {
        setCurrentEnding(null)
        setCurrentScreen('game')
    }

    function handleContinue() {
        try {
            loadGame()
        } catch (err) {
            console.warn('Load game failed', err)
        }
        setCurrentScreen('game')
    }

    // ===== Midnight handlers =====
    function handleMidnightSelect(
        choice: 'mid_sleep' | 'mid_play' | 'mid_study'
    ) {
        const choiceId = `day${day}_${choice}`
        try {
            makeChoice(choiceId)
        } catch (err) {
            console.warn('Midnight choice error', err)
        }
        setCurrentScreen('game')
    }

    // ===== Hospital =====
    function handleHospitalContinue() {
        setCurrentScreen('game')
    }

    // ===== Exam =====
    function handleExamFinished() {
        if (endingId && endings?.[endingId]) {
            setCurrentEnding(endings[endingId])
            setCurrentScreen('ending')
            return
        }
        setCurrentScreen('game')
    }

    // ===== Ending =====
    function handleEndingClose() {
        setCurrentEnding(null)
        setCurrentScreen('menu')
    }

    // ===== Render =====
    return (
        <div className="w-screen h-screen bg-black text-white overflow-hidden">
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

            {currentScreen === 'ending' && currentEnding && (
                <EndingScreen
                    ending={currentEnding}
                    onClose={handleEndingClose}
                />
            )}

            {currentScreen === 'settings' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
                    <div className="bg-white/10 p-6 rounded-xl">
                        <button
                            onClick={() => setCurrentScreen('menu')}
                            className="px-4 py-2 bg-primary rounded"
                        >
                            Đóng Cài đặt
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
