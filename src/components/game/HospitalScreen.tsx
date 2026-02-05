import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSound from '../../hooks/useSound'
import { useGameStore } from '../../stores/gameStore'

/* Inline Icons */
function IconAmbulance({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M10 10H6" /><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" /><path d="M19 18v-7.2a2 2 0 0 0-.6-1.4l-4.4-4.4" /><path d="M8 8v4" /><path d="M22 18h-2" /><circle cx="8" cy="18" r="2" /><circle cx="17" cy="18" r="2" />
        </svg>
    )
}

type Props = {
    onContinue?: () => void
}

export default function HospitalScreen({ onContinue }: Props) {
    const [stage, setStage] = useState<'blackout' | 'info'>('blackout')
    const updateStats = useGameStore(s => s.updateStats)
    const nextDay = useGameStore(s => s.nextDay)
    const { playSfx } = useSound()

    useEffect(() => {
        playSfx('/assets/sounds/siren.mp3', 0.5)
        setTimeout(() => setStage('info'), 3000)
    }, [])

    const handleDischarge = () => {
        // Hồi phục và Reset
        updateStats({
            health: 80, // Hồi lại sức
            stress: -30,
            sleepless_count: -100, // Reset triệt để về 0
            money: -100000,
            knowledge: -5 // Giảm kiến thức do nghỉ học
        })

        // Skip ngày hiện tại (Nhảy sang ngày kế tiếp)
        nextDay()

        onContinue?.()
    }

    return (
        <div className="fixed inset-0 z-50 bg-black text-white flex items-center justify-center p-6">
            <AnimatePresence mode='wait'>
                {stage === 'blackout' && (
                    <motion.div
                        key="blackout"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl font-bold text-red-600 mb-4 animate-pulse">CẤP CỨU...</h1>
                        <p className="text-neutral-400">Bạn đã kiệt sức.</p>
                    </motion.div>
                )}

                {stage === 'info' && (
                    <motion.div
                        key="info"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md w-full bg-neutral-900 border border-red-500/50 p-8 rounded-2xl shadow-2xl text-center"
                    >
                        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <IconAmbulance className="w-8 h-8 text-red-500" />
                        </div>

                        <h2 className="text-2xl font-bold mb-4">Bệnh Viện K</h2>
                        <div className="text-left space-y-3 bg-white/5 p-4 rounded-lg mb-6 text-sm">
                            <p>🔴 <strong>Chẩn đoán:</strong> Suy nhược cơ thể nghiêm trọng.</p>
                            <p>🕒 <strong>Hậu quả:</strong> Phải nghỉ ngơi 1 ngày.</p>
                            <p>💸 <strong>Viện phí:</strong> 100.000 VNĐ.</p>
                            <p>📉 <strong>Kiến thức:</strong> Giảm sút nhẹ.</p>
                        </div>

                        <button
                            onClick={handleDischarge}
                            className="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                        >
                            Xuất viện & Tiếp tục (Sang ngày hôm sau)
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}