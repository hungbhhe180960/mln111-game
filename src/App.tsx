import React, { useEffect, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'

// --- FIX IMPORT PATHS ---
import MainMenu from './components/screens/MainMenu'
import SettingsScreen from './components/screens/SettingsScreen'
import PauseMenu from './components/screens/PauseMenu'

import GameScreen from './components/game/GameScreen'
import MidnightChoice from './components/game/MidnightChoice'
import HospitalScreen from './components/game/HospitalScreen'
import ExamScreen from './components/game/ExamScreen'
import EndingScreen from './components/game/EndingScreen'

import AchievementToast from './components/ui/AchievementToast'

import { useGameStore } from './stores/gameStore'
import type { Ending, GameEvent } from './types/game.types'
import { EVENTS } from './data/events'

type Screen =
    | 'menu'
    | 'game'
    | 'settings'
    | 'ending'
    | 'hospital'
    | 'exam'
    | 'midnight'

const EVENT_LIST: GameEvent[] = Object.values(EVENTS)

// Helper để tìm sự kiện bắt đầu ngày
function findStartEvent(day: number): GameEvent | null {
    return (
        EVENT_LIST.find(e => e.id === `day${day}_start`) ??
        EVENT_LIST.find(e => e.day === day) ??
        null
    )
}

export default function App() {
    const [currentScreen, setCurrentScreen] = useState<Screen>('menu')
    const [isPaused, setIsPaused] = useState(false)
    const [showSettingsFromPause, setShowSettingsFromPause] = useState(false)

    // State chặn click liên tục gây lỗi logic (race condition)
    const [isProcessing, setIsProcessing] = useState(false)
    const [hasProcessedMidnight, setHasProcessedMidnight] = useState(false)

    // ===== Store selectors =====
    const day = useGameStore(s => s.day)
    const time = useGameStore(s => s.time)
    const stats = useGameStore(s => s.stats)
    const endingId = useGameStore(s => s.endingId)
    const currentEventId = useGameStore(s => s.currentEventId)
    const endings = useGameStore(s => s.endings)

    // Actions
    const nextDay = useGameStore(s => s.nextDay)
    const updateStats = useGameStore(s => s.updateStats)
    const addFlag = useGameStore(s => s.addFlag)
    const loadGame = useGameStore(s => s.loadGame)
    const saveGame = useGameStore(s => s.saveGame)

    // ===== Screen Routing Logic =====
    useEffect(() => {
        if (isProcessing) return
        setIsProcessing(false)

        if (currentScreen === 'menu' || currentScreen === 'settings') return

        // 1. Ending Check
        if (endingId) {
            setCurrentScreen('ending')
            return
        }

        // 🟢 KIỂM TRA: Nếu currentEventId là midnight_trigger và time là 24:00
        // Thì chuyển sang midnight screen (không cần kiểm tra stats)
        if ((time === '24:00' || time === '00:00') && currentEventId?.includes('midnight_trigger')) {
            if (currentScreen !== 'midnight') {
                setCurrentScreen('midnight')
            }
            return
        }

        // 2. Hospital Check
        if (stats.health <= 0 || stats.sleepless_count >= 2) {
            if (currentScreen !== 'hospital') {
                setCurrentScreen('hospital')
            }
            return
        }

        // 3. Exam Check (Day 7 - 08:30)
        if (day === 7 && time === '08:30') {
            setCurrentScreen('exam')
            return
        }

        // 4. Default Game Screen
        setCurrentScreen('game')

    }, [day, time, stats.health, stats.sleepless_count, endingId, currentScreen, currentEventId, isProcessing])

    const handleStartNew = () => {
        if (isProcessing) return
        setIsProcessing(true)
        useGameStore.getState().resetGame()
        setCurrentScreen('game')
        setTimeout(() => setIsProcessing(false), 100)
    }

    const handleContinue = () => {
        if (isProcessing) return
        setIsProcessing(true)
        const loaded = loadGame()
        if (loaded) {
            setCurrentScreen('game')
        }
        setTimeout(() => setIsProcessing(false), 100)
    }

    // ===== LOGIC MIDNIGHT (FIX LỖI SKIP NGÀY) =====
    const handleMidnightSelect = useCallback((choiceId: 'mid_sleep' | 'mid_play' | 'mid_study') => {
        if (isProcessing) return

        setIsProcessing(true)
        setHasProcessedMidnight(true)

        // Lấy giá trị hiện tại để tính toán chính xác
        const currentStats = useGameStore.getState().stats
        const currentHealth = currentStats.health
        const currentSleepless = currentStats.sleepless_count

        let dKnowledge = 0
        let dHealth = 0
        let dStress = 0
        let dSleepless = 0
        let dConsciousness = 0

        if (choiceId === 'mid_sleep') {
            // NGỦ: Reset sleepless về 0, hồi máu
            dHealth = 30
            dStress = -30
            dConsciousness = 30
            dSleepless = -currentSleepless // Reset về 0
        } else {
            // THỨC
            dSleepless = 1 // +1 đêm

            // Xử lý mất máu
            let healthPenalty = (choiceId === 'mid_study') ? -25 : -15

            // Nếu đây là đêm thức đầu tiên, đảm bảo không chết ngay
            if (currentSleepless === 0 && currentHealth + healthPenalty <= 0) {
                healthPenalty = -(currentHealth - 5) // Giữ lại 5 HP
            }

            dHealth = healthPenalty

            if (choiceId === 'mid_play') {
                dStress = -20
                dKnowledge = -5
                dConsciousness = -15
                addFlag('night_owl_pattern')
            } else if (choiceId === 'mid_study') {
                dKnowledge = 5
                dStress = 15
                dConsciousness = -15
                addFlag('grinder_pattern')
            }
        }

        updateStats({
            knowledge: dKnowledge,
            health: dHealth,
            stress: dStress,
            sleepless_count: dSleepless,
            consciousness: dConsciousness
        })

        // 🟢 FIX QUAN TRỌNG: Xử lý chuyển ngày ĐÚNG CÁCH
        setTimeout(() => {
            const store = useGameStore.getState()
            const nextDayNum = store.day + 1

            if (nextDayNum <= 7) {
                // Tìm sự kiện bắt đầu ngày mới
                const ev = findStartEvent(nextDayNum)

                // Cập nhật store trực tiếp để đảm bảo đồng bộ
                useGameStore.setState({
                    day: nextDayNum,
                    time: ev?.time && ev.time !== '24:00' ? ev.time : '08:00',
                    currentEventId: ev?.id || `day${nextDayNum}_start`
                })

                saveGame()

                // Chuyển sang game screen sau khi đã cập nhật xong
                setTimeout(() => {
                    setCurrentScreen('game')
                    setIsProcessing(false)
                }, 50)
            } else {
                // Nếu là ngày cuối
                nextDay()
                setTimeout(() => setIsProcessing(false), 100)
            }
        }, 100)

    }, [nextDay, updateStats, addFlag, isProcessing, saveGame])

    const handleHospitalContinue = () => {
        if (isProcessing) return
        setIsProcessing(true)
        // HospitalScreen đã tự gọi nextDay() để skip ngày khi discharge
        setTimeout(() => {
            setCurrentScreen('game')
            setIsProcessing(false)
        }, 100)
    }

    const handleExamFinished = () => {
        // Logic kết thúc được xử lý trong ExamScreen -> Store
    }

    // Pause Menu handler
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
                    disabled={isProcessing}
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