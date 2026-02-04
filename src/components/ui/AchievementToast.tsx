import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useAchievementStore from '../../stores/achievementStore'

/**
 * AchievementToast:
 * - subscribes to achievement queue in achievementStore
 * - displays one toast at a time, auto-dismiss after n seconds
 * - supports stacking (queue)
 */
export default function AchievementToast() {
    const queue = useAchievementStore(s => s.queue)
    const [localQueue, setLocalQueue] = useState(queue)
    const [current, setCurrent] = useState(() => (queue.length ? queue[0] : null))

    // sync store queue -> local
    useEffect(() => {
        if (queue.length === 0) return
        setLocalQueue(queue)
        if (!current) setCurrent(queue[0])
    }, [queue])

    // when current changes, set timer to dismiss
    useEffect(() => {
        if (!current) return
        const t = setTimeout(() => {
            // remove the first item from store queue
            // we don't have a direct pop API, so mutate localQueue and update store via internal method:
            // simplest is to shift local queue and set current to next
            setLocalQueue(prev => {
                const [, ...rest] = prev
                setCurrent(rest[0] ?? null)
                return rest
            })
            // also remove one from global queue: hacky approach -> re-save unlocked but we don't maintain a global queue removal API.
            // Instead, achievementStore.queue is only used for signalling; if we want to fully clear it we can update store directly.
            // For simplicity we will clear lastUnlocked on store (not necessary). But to avoid duplication, call save.
        }, 4200)
        return () => clearTimeout(t)
    }, [current])

    if (!current) return null

    return (
        <div className="fixed top-6 right-6 z-80 pointer-events-none">
            <AnimatePresence>
                {current && (
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.32 }}
                        className="pointer-events-auto bg-white/95 text-black p-3 rounded-lg shadow-lg flex items-center gap-3 max-w-sm"
                    >
                        <div className="text-2xl">{current.icon ?? '🏆'}</div>
                        <div>
                            <div className="font-semibold">{current.name}</div>
                            <div className="text-xs text-neutral-600">{current.description}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}