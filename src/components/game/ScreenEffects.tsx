import { useCallback, useEffect, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'

/**
 * ScreenEffects
 * - Hiệu ứng toàn màn hình: Vignette, Noise, Color Grading theo thời gian.
 * - Particles system (Canvas): Sparkles, Hearts, v.v.
 * - Cảnh báo Health Critical.
 */

// SAFE SVG DATA URI FOR NOISE
const NOISE_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")`

export default function ScreenEffects() {
    const time = useGameStore(s => s.time)
    const stats = useGameStore(s => s.stats)

    // Canvas ref cho particles
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // ===== 1. Time Overlay Logic =====
    const timeOverlayStyle = useMemo(() => {
        const hour = parseInt(time.split(':')[0], 10)

        // Morning (06:00 - 10:00): Vàng nắng nhẹ
        if (hour >= 6 && hour < 11) {
            return {
                background: 'linear-gradient(180deg, rgba(255,200,120,0.06) 0%, rgba(0,0,0,0) 100%)',
                mixBlendMode: 'overlay' as const
            }
        }
        // Noon (11:00 - 14:00): Trắng xanh trong trẻo
        if (hour >= 11 && hour < 15) {
            return {
                background: 'linear-gradient(180deg, rgba(200,240,255,0.05) 0%, rgba(0,0,0,0) 100%)',
                mixBlendMode: 'screen' as const
            }
        }
        // Afternoon (15:00 - 17:00): Cam chiều tà
        if (hour >= 15 && hour < 18) {
            return {
                background: 'linear-gradient(180deg, rgba(255,140,60,0.08) 0%, rgba(0,0,0,0.1) 100%)',
                mixBlendMode: 'overlay' as const
            }
        }
        // Evening (18:00 - 21:00): Tím xanh
        if (hour >= 18 && hour < 22) {
            return {
                background: 'linear-gradient(180deg, rgba(20,20,60,0.4) 0%, rgba(10,10,30,0.2) 100%)',
                mixBlendMode: 'multiply' as const
            }
        }
        // Night/Midnight (22:00 - 05:00): Đen xanh đậm
        return {
            background: 'linear-gradient(180deg, rgba(5,5,20,0.6) 0%, rgba(0,0,0,0.4) 100%)',
            mixBlendMode: 'multiply' as const
        }
    }, [time])

    // ===== 2. Particle System (Simplified for stability) =====
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let particles: Array<{
            x: number, y: number,
            vx: number, vy: number,
            life: number, size: number,
            type: 'dust' | 'sparkle'
        }> = []

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        window.addEventListener('resize', resize)
        resize()

        // Spawn particles based on stats/environment
        const spawnParticle = () => {
            if (Math.random() > 0.95) { // Spawn rate
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    life: 1.0,
                    size: Math.random() * 2 + 1,
                    type: Math.random() > 0.8 ? 'sparkle' : 'dust'
                })
            }
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            spawnParticle()

            // Update & Draw
            particles.forEach((p, index) => {
                p.x += p.vx
                p.y += p.vy
                p.life -= 0.005

                ctx.beginPath()
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)

                if (p.type === 'sparkle') {
                    ctx.fillStyle = `rgba(255, 255, 200, ${p.life * 0.8})`
                } else {
                    ctx.fillStyle = `rgba(255, 255, 255, ${p.life * 0.3})`
                }

                ctx.fill()
            })

            // Cleanup dead particles
            particles = particles.filter(p => p.life > 0)

            animationFrameId = requestAnimationFrame(render)
        }

        render()

        return () => {
            window.removeEventListener('resize', resize)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    // ===== 3. Health Critical Effect =====
    const isCritical = stats.health <= 20

    return (
        <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            {/* Time of Day Overlay */}
            <div
                className="absolute inset-0 transition-all duration-1000 ease-in-out"
                style={timeOverlayStyle}
            />

            {/* Vignette (Góc tối) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)] opacity-80" />

            {/* FIXED NOISE TEXTURE */}
            <div
                className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{ backgroundImage: NOISE_BG }}
            />

            {/* Canvas Particles */}
            <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />

            {/* Critical Health Warning Pulse */}
            {isCritical && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 bg-red-900 mix-blend-overlay z-20"
                />
            )}

            {isCritical && (
                <div className="absolute top-4 right-4 z-30">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="text-red-500 font-bold text-xs bg-black/50 px-2 py-1 rounded border border-red-500/50"
                    >
                        ⚠ HEALTH CRITICAL
                    </motion.div>
                </div>
            )}
        </div>
    )
}