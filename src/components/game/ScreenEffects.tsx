import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import useDevice from '../../hooks/useDevice'
import { useGameStore } from '../../stores/gameStore'
import type { Stats } from '../../types/game.types'

/**
 * ScreenEffects
 *
 * - Provides full-screen visual overlays and a lightweight particle system.
 * - Vignette, screen shake, blur and color-grading depend on game state (stress/health/sleepless/time).
 * - Particles (canvas) spawn on stat changes:
 *    * Sparkles when knowledge increases
 *    * Hearts when stress decreases
 *    * Warning icons when health decreases
 * - Page-curl animation runs when day changes.
 *
 * Performance:
 * - On mobile/tablet we drastically reduce particle counts and disable expensive effects.
 * - Canvas uses requestAnimationFrame loop with pooled particles.
 * - Canvas is resized to devicePixelRatio to stay crisp.
 *
 * Usage:
 * - Mount once near the top-level of your app (e.g., inside GameScreen). The component reads store state.
 *
 * Notes:
 * - This implementation avoids external libs for particles to reduce bundle size.
 * - If you want fancier particles, you can swap the canvas rendering for a library (e.g., pixi.js or tsParticles).
 */

const MAX_PARTICLES_DESKTOP = 80
const MAX_PARTICLES_TABLET = 40
const MAX_PARTICLES_MOBILE = 18

type Particle = {
    x: number
    y: number
    vx: number
    vy: number
    size: number
    life: number
    ttl: number
    color: string
    type: 'sparkle' | 'heart' | 'warn'
    rotation?: number
    spin?: number
}

function usePrevious<T>(v: T) {
    const ref = useRef<T | null>(null)
    useEffect(() => {
        ref.current = v
    }, [v])
    return ref.current
}

export default function ScreenEffects() {
    const { isMobile, isTablet, isDesktop } = useDevice()
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'

    // Game store
    const stats = useGameStore(s => s.stats)
    const day = useGameStore(s => s.day)
    const time = useGameStore(s => s.time)
    const flags = useGameStore(s => s.flags)

    // previous values to detect deltas
    const prevStats = usePrevious<Stats>(stats)
    const prevDay = usePrevious<number>(day)

    // canvas ref
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const rafRef = useRef<number | null>(null)
    const particlesRef = useRef<Particle[]>([])
    const lastSpawnRef = useRef<number>(0)

    // page curl state
    const [curling, setCurling] = useState(false)
    useEffect(() => {
        if (prevDay !== undefined && prevDay !== null && prevDay !== day) {
            // trigger page curl
            setCurling(true)
            const t = setTimeout(() => setCurling(false), 1200)
            return () => clearTimeout(t)
        }
    }, [day, prevDay])

    // Effects thresholds
    const isHealthLow = stats.health < 30
    const isStressHigh = stats.stress > 80
    const hasSleepless = stats.sleepless_count >= 1

    // Particle capacity per device
    const maxParticles = isDesktop ? MAX_PARTICLES_DESKTOP : isTablet ? MAX_PARTICLES_TABLET : MAX_PARTICLES_MOBILE

    // Map time to color grading overlay
    const getTimeOverlayStyle = useCallback(() => {
        // Return an object with CSS filter & overlay color (rgba)
        if (time.startsWith('08')) {
            // morning warm
            return {
                overlay: 'linear-gradient(180deg, rgba(255,200,120,0.06), rgba(0,0,0,0.05))',
                filter: 'saturate(1.05) contrast(1.02) sepia(0.08)',
            }
        }
        if (time.startsWith('16')) {
            // sunset
            return {
                overlay: 'linear-gradient(180deg, rgba(255,140,60,0.08), rgba(0,0,0,0.08))',
                filter: 'saturate(1.08) contrast(1.03) hue-rotate(-6deg)',
            }
        }
        // midnight
        return {
            overlay: 'linear-gradient(180deg, rgba(20,40,90,0.18), rgba(0,0,0,0.28))',
            filter: 'saturate(0.9) contrast(0.95) hue-rotate(180deg) brightness(0.85)',
        }
    }, [time])

    // spawn helpers
    const spawnParticle = useCallback(
        (type: Particle['type'], amount = 6) => {
            const canvas = canvasRef.current
            if (!canvas) return
            const rect = canvas.getBoundingClientRect()
            const w = rect.width
            const h = rect.height
            const particles = particlesRef.current
            const now = performance.now()
            // throttle spawn bursts a little
            if (now - lastSpawnRef.current < 90) return
            lastSpawnRef.current = now

            for (let i = 0; i < amount; i++) {
                if (particles.length >= maxParticles) break
                const angle = Math.random() * Math.PI * 2
                const speed = (type === 'sparkle' ? 0.6 : type === 'heart' ? 0.9 : 0.45) * (1 + Math.random() * 0.8)
                const size = type === 'sparkle' ? 1 + Math.random() * 2.6 : type === 'heart' ? 6 + Math.random() * 6 : 7 + Math.random() * 8
                const p: Particle = {
                    x: w * (0.2 + Math.random() * 0.6),
                    y: h * (0.2 + Math.random() * 0.6),
                    vx: Math.cos(angle) * speed * (isMobile ? 0.6 : 1),
                    vy: Math.sin(angle) * speed * (isMobile ? 0.6 : 1) - (type === 'sparkle' ? 0.4 : 0),
                    size,
                    life: 0,
                    ttl: 600 + Math.random() * 800,
                    color: type === 'sparkle' ? `rgba(255, 255, 220, ${0.8 + Math.random() * 0.2})` : type === 'heart' ? `rgba(255,90,120,${0.85})` : `rgba(255,60,60,0.95)`,
                    type,
                    rotation: Math.random() * Math.PI * 2,
                    spin: (Math.random() - 0.5) * 0.06,
                }
                particles.push(p)
            }
        },
        [maxParticles, isMobile]
    )

    // spawn bursts based on stat changes
    useEffect(() => {
        if (!prevStats) return
        // knowledge up -> sparkles
        if (stats.knowledge > prevStats.knowledge) {
            const diff = Math.min(30, stats.knowledge - prevStats.knowledge)
            const amount = Math.max(4, Math.round((diff / 30) * (isDesktop ? 30 : isTablet ? 18 : 8)))
            spawnParticle('sparkle', amount)
        }
        // stress down -> hearts
        if (stats.stress < prevStats.stress) {
            const diff = Math.min(50, prevStats.stress - stats.stress)
            const amount = Math.max(3, Math.round((diff / 50) * (isDesktop ? 26 : isTablet ? 14 : 6)))
            spawnParticle('heart', amount)
        }
        // health down -> warnings
        if (stats.health < prevStats.health) {
            const diff = Math.min(50, prevStats.health - stats.health)
            const amount = Math.max(2, Math.round((diff / 50) * (isDesktop ? 18 : isTablet ? 8 : 4)))
            spawnParticle('warn', amount)
        }
    }, [stats, prevStats, spawnParticle, isDesktop, isTablet])

    // canvas render loop
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let mounted = true
        particlesRef.current = particlesRef.current ?? []

        function resizeCanvasToDisplaySize() {
            const dpr = window.devicePixelRatio || 1
            const rect = canvas.getBoundingClientRect()
            const width = rect.width
            const height = rect.height
            const w = Math.max(1, Math.floor(width * dpr))
            const h = Math.max(1, Math.floor(height * dpr))
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w
                canvas.height = h
                canvas.style.width = `${width}px`
                canvas.style.height = `${height}px`
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // scale context for dpr
            }
            return { width, height }
        }

        function step(ts: number) {
            if (!mounted) return
            const rect = canvas.getBoundingClientRect()
            const { width, height } = resizeCanvasToDisplaySize()
            // clear
            ctx.clearRect(0, 0, width, height)

            const particles = particlesRef.current
            // update & draw particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i]
                p.life += 16.6
                if (p.life >= p.ttl) {
                    particles.splice(i, 1)
                    continue
                }
                // physics
                p.vx *= 0.997
                p.vy += (p.type === 'sparkle' ? -0.002 : 0.06) // sparkles gently drift upward; others fall
                p.x += p.vx * (isMobile ? 0.8 : 1.0) * (Math.max(0.6, Math.min(1.4, (width / 900))))
                p.y += p.vy * (isMobile ? 0.8 : 1.0) * (Math.max(0.6, Math.min(1.4, (height / 600))))
                p.rotation = (p.rotation ?? 0) + (p.spin ?? 0)

                // fade factor
                const t = p.life / p.ttl
                const alpha = 1 - t
                if (p.type === 'sparkle') {
                    ctx.beginPath()
                    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
                    g.addColorStop(0, `rgba(255,255,220,${0.95 * alpha})`)
                    g.addColorStop(0.4, `rgba(255,220,160,${0.6 * alpha})`)
                    g.addColorStop(1, `rgba(255,220,160,${0.0})`)
                    ctx.fillStyle = g
                    ctx.fillRect(p.x - p.size * 3, p.y - p.size * 3, p.size * 6, p.size * 6)
                    ctx.closePath()
                } else if (p.type === 'heart') {
                    // simple heart-like shape via rotated rectangle with arc - keep cheap
                    ctx.save()
                    ctx.translate(p.x, p.y)
                    ctx.rotate(p.rotation ?? 0)
                    ctx.globalAlpha = alpha * 0.95
                    ctx.fillStyle = p.color
                    // two circles + triangle to approximate heart
                    ctx.beginPath()
                    ctx.arc(-p.size / 2, 0, p.size / 2, 0, Math.PI * 2)
                    ctx.arc(p.size / 2, 0, p.size / 2, 0, Math.PI * 2)
                    ctx.moveTo(-p.size, p.size / 3)
                    ctx.lineTo(0, p.size * 1.6)
                    ctx.lineTo(p.size, p.size / 3)
                    ctx.closePath()
                    ctx.fill()
                    ctx.restore()
                } else {
                    // warning - triangle or exclamation
                    ctx.save()
                    ctx.globalAlpha = alpha
                    ctx.fillStyle = p.color
                    ctx.beginPath()
                    ctx.moveTo(p.x, p.y - p.size)
                    ctx.lineTo(p.x - p.size, p.y + p.size)
                    ctx.lineTo(p.x + p.size, p.y + p.size)
                    ctx.closePath()
                    ctx.fill()
                    ctx.fillStyle = 'white'
                    ctx.font = `${Math.max(8, p.size - 2)}px sans-serif`
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('!', p.x, p.y + p.size * 0.1)
                    ctx.restore()
                }
            }

            rafRef.current = requestAnimationFrame(step)
        }

        rafRef.current = requestAnimationFrame(step)

        // cleanup
        return () => {
            mounted = false
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMobile, isTablet, isDesktop, maxParticles])

    // Expose a small public API by listening to flagged events (e.g., flags set by store)
    // Not strictly necessary here; we already spawn on stats delta.

    // Color grading & overlay styling
    const style = getTimeOverlayStyle()

    function getTimeOverlayStyle() {
        if (time.startsWith('08')) {
            return {
                overlay: 'linear-gradient(180deg, rgba(255,200,120,0.06), rgba(0,0,0,0.05))',
                filter: 'saturate(1.05) contrast(1.02) sepia(0.08)',
            }
        }
        if (time.startsWith('16')) {
            return {
                overlay: 'linear-gradient(180deg, rgba(255,140,60,0.08), rgba(0,0,0,0.08))',
                filter: 'saturate(1.08) contrast(1.03) hue-rotate(-6deg)',
            }
        }
        return {
            overlay: 'linear-gradient(180deg, rgba(20,40,90,0.18), rgba(0,0,0,0.28))',
            filter: 'saturate(0.9) contrast(0.95) hue-rotate(180deg) brightness(0.85)',
        }
    }

    // Accessibility / pointer-events none: effect overlays shouldn't block interactions
    return (
        <>
            {/* Canvas for particles */}
            <canvas
                ref={canvasRef}
                className="pointer-events-none absolute inset-0 w-full h-full z-40"
                style={{ mixBlendMode: 'screen', willChange: 'transform, opacity' }}
            />

            {/* Color grading overlay */}
            <div
                aria-hidden
                style={{
                    background: style.overlay,
                    filter: style.filter,
                }}
                className="pointer-events-none absolute inset-0 z-30 transition-colors duration-600"
            />

            {/* Vignette */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-50"
                style={{
                    background:
                        isStressHigh && !isMobile
                            ? 'radial-gradient(circle at center, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.6) 100%)'
                            : 'radial-gradient(circle at center, rgba(0,0,0,0.0) 70%, rgba(0,0,0,0.28) 100%)',
                    transition: 'background 420ms ease',
                }}
            />

            {/* Blur overlay for sleepless */}
            {hasSleepless && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-45"
                    style={{
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        opacity: 0.06,
                        transition: 'opacity 320ms ease',
                    }}
                />
            )}

            {/* Screen shake wrapper - apply subtle transform via framer-motion to a high z-index container
          Host components should wrap their main content inside a motion.div that reads the same props,
          but for convenience we provide a visual wrapper at top-level that can animate small translate. */}
            <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-60"
                animate={isHealthLow ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                transition={isHealthLow ? { duration: 0.9, repeat: Infinity, repeatType: 'reverse' } : { duration: 0.2 }}
                style={{ touchAction: 'none' }}
            />

            {/* Page curl animation when day changes */}
            <AnimatePageCurl active={curling} />

            {/* Small corner overlays for warnings */}
            {isHealthLow && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="pointer-events-none absolute top-6 left-6 z-60"
                >
                    <div className="bg-red-600 text-white px-3 py-2 rounded shadow-lg text-sm font-semibold">Health Critical</div>
                </motion.div>
            )}
        </>
    )
}

/* Page curl effect - simple animated corner fold */
function AnimatePageCurl({ active }: { active: boolean }) {
    return (
        <div className="pointer-events-none absolute inset-0 z-70">
            <motion.div
                initial={{ opacity: 0, rotate: -18, scale: 0.8, x: '30%', y: '-30%' }}
                animate={active ? { opacity: 1, rotate: [ -18, -6, 0 ], scale: [0.8, 1.02, 1], x: '0%', y: '0%' } : { opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeInOut' }}
                style={{
                    width: '38%',
                    height: '45%',
                    position: 'absolute',
                    right: '-10%',
                    top: '-8%',
                    transformOrigin: 'right top',
                    background:
                        'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)), linear-gradient(0deg, rgba(0,0,0,0.06), rgba(0,0,0,0.02))',
                    borderRadius: '8px',
                    boxShadow: '0 30px 80px rgba(2,6,23,0.6)',
                }}
            />
        </div>
    )
}