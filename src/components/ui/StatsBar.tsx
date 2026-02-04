import React from 'react'
import { motion } from 'framer-motion'

type Props = {
    label?: string
    value: number // 0-100
    color?: string // optional custom color base, e.g. "bg-primary"
    icon?: React.ReactElement
    className?: string
}

/**
 * StatsBar - hiển thị 1 thanh progress (không hiển thị số)
 * - gradient color dựa trên value: red <30, yellow 30-70, green >70
 * - animated fill bằng framer-motion
 */
export default function StatsBar({ label, value, color, icon, className = '' }: Props) {
    const safeValue = Math.max(0, Math.min(100, Math.round(value)))
    // choose gradient based on safeValue
    let gradient = 'linear-gradient(90deg,#84cc16,#16a34a)' // green default
    if (safeValue < 30) {
        gradient = 'linear-gradient(90deg,#f87171,#ef4444)' // red
    } else if (safeValue <= 70) {
        gradient = 'linear-gradient(90deg,#facc15,#f97316)' // yellow/orange
    }
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {icon && <div className="w-8 h-8 flex items-center justify-center text-lg text-neutral-700">{icon}</div>}
            <div className="flex-1">
                {/* optional label visually hidden but useful for accessibility */}
                {label && <div className="text-xs text-neutral-500 mb-1 select-none">{label}</div>}
                <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${safeValue}%` }}
                        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                        className="h-3"
                        style={{ background: gradient }}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={safeValue}
                        role="progressbar"
                    />
                </div>
            </div>
        </div>
    )
}