import React, { useRef, useState } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

type Variant = 'primary' | 'danger' | 'neutral'

type Props = HTMLMotionProps<'button'> & {
    variant?: Variant
    loading?: boolean
}

export default function Button({
                                   variant = 'primary',
                                   loading = false,
                                   disabled = false,
                                   children,
                                   className = '',
                                   onClick,
                                   ...rest
                               }: Props) {
    const ref = useRef<HTMLButtonElement>(null)
    const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
    const disabledFinal = disabled || loading

    const variantClasses: Record<Variant, string> = {
        primary: 'bg-primary text-white hover:bg-primary-600',
        danger: 'bg-danger text-white hover:bg-danger-600',
        neutral: 'bg-white text-neutral-800 border border-neutral-200 hover:bg-neutral-50',
    }

    function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
        if (disabledFinal) {
            e.preventDefault()
            return
        }

        const btn = ref.current
        if (btn) {
            const rect = btn.getBoundingClientRect()
            const x = e.clientX - rect.left
            const y = e.clientY - rect.top
            const id = Date.now() + Math.random()
            setRipples(r => [...r, { x, y, id }])
            setTimeout(() => {
                setRipples(r => r.filter(p => p.id !== id))
            }, 700)
        }

        onClick?.(e)
    }

    return (
        <motion.button
            ref={ref}
            onClick={handleClick}
            whileHover={!disabledFinal ? { scale: 1.02 } : undefined}
            whileTap={!disabledFinal ? { scale: 0.98 } : undefined}
            disabled={disabledFinal}
            className={`relative overflow-hidden inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors
              ${variantClasses[variant]}
              ${disabledFinal ? 'opacity-60 cursor-not-allowed' : ''}
              ${className}`}
            {...rest}
        >
            {/* ripples */}
            <span aria-hidden className="absolute inset-0 pointer-events-none">
                {ripples.map(r => (
                    <span
                        key={r.id}
                        style={{ left: r.x, top: r.y }}
                        className="absolute w-3 h-3 rounded-full bg-white/30 -translate-x-1/2 -translate-y-1/2 animate-ripple"
                    />
                ))}
            </span>

            <span className="flex items-center gap-2">
                {loading && (
                    <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                )}
                <span style={{ pointerEvents: 'none' }}>{children}</span>
            </span>
        </motion.button>
    )
}
