import { motion } from 'framer-motion'
import { FaLock, FaGamepad, FaBook, FaMoon, FaPaperclip } from 'react-icons/fa'
import type { Choice } from '../../types/game.types'

type Props = {
    choice: Choice
    onSelect: (choiceId: string) => void
    disabled?: boolean
    isLocked?: boolean
    lockReason?: string
}

/**
 * Heuristic icon hint based on choice text
 */
function hintIconForText(text: string) {
    const lc = text.toLowerCase()
    if (lc.includes('game') || lc.includes('play') || lc.includes('game') || lc.includes('trò chơi') || lc.includes('cày')) {
        return <FaGamepad className="text-sm" />
    }
    if (lc.includes('học') || lc.includes('study') || lc.includes('ôn') || lc.includes('sách') || lc.includes('đọc')) {
        return <FaBook className="text-sm" />
    }
    if (lc.includes('ngủ') || lc.includes('sleep') || lc.includes('đi ngủ') || lc.includes('ngủ sớm')) {
        return <FaMoon className="text-sm" />
    }
    if (lc.includes('phao') || lc.includes('cheat') || lc.includes('phaó') || lc.includes('phao thi')) {
        return <FaPaperclip className="text-sm" />
    }
    // fallback
    return null
}

export default function ChoiceCard({ choice, onSelect, disabled = false, isLocked = false, lockReason }: Props) {
    const hintIcon = hintIconForText(choice.text)

    function handleClick() {
        if (disabled || isLocked) return
        onSelect(choice.id)
    }

    return (
        <motion.div
            layout
            whileHover={!disabled && !isLocked ? { scale: 1.02, boxShadow: '0 10px 30px rgba(2,6,23,0.12)' } : {}}
            whileTap={!disabled && !isLocked ? { scale: 0.98 } : {}}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className={`relative bg-white border rounded-lg p-4 md:p-5 cursor-pointer select-none min-h-[64px] flex flex-col justify-between
        ${disabled || isLocked ? 'opacity-70 cursor-not-allowed' : ''}
        `}
            onClick={handleClick}
            role="button"
            aria-disabled={disabled || isLocked}
            title={isLocked && lockReason ? lockReason : undefined}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <div className="text-sm md:text-base font-medium text-neutral-800 break-words">{choice.text}</div>
                    {choice.flags && choice.flags.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                            {choice.flags.map(f => (
                                <span key={f} className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600">
                  {f}
                </span>
                            ))}
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-col items-end gap-2">
                    {/* subtle hint icon */}
                    <div className="text-primary/90">{hintIcon}</div>

                    {/* lock icon */}
                    {isLocked ? (
                        <div className="relative group">
                            <FaLock className="text-neutral-500" />
                            {/* tooltip */}
                            {lockReason ? (
                                <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity origin-top-right absolute right-0 top-6 z-10 w-48 bg-black/80 text-white text-xs p-2 rounded">
                                    {lockReason}
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </motion.div>
    )
}