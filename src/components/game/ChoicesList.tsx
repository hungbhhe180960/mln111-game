import { motion, type Variants } from 'framer-motion'
import type { Choice } from '../../types/game.types'
import ChoiceCard from './ChoiceCard'

type Props = {
    choices: Choice[]
    onSelect: (choiceId: string) => void
    disabled?: boolean
    lockedMap?: Record<string, { locked: boolean; reason?: string }>
}

/**
 * Stagger variants for list + items
 */
const listVariants: Variants = {
    hidden: {
        opacity: 1, // 👈 phải có target, không được {}
    },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
            delayChildren: 0.06,
        },
    },
}

const itemVariants: Variants = {
    hidden: {
        opacity: 0,
        y: 8,
        scale: 0.985,
    },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            type: 'spring',
            stiffness: 300,
            damping: 28,
        },
    },
}

export default function ChoicesList({
                                        choices,
                                        onSelect,
                                        disabled = false,
                                        lockedMap = {},
                                    }: Props) {
    if (!choices || choices.length === 0) return null

    return (
        <motion.ul
            initial="hidden"
            animate="show"
            variants={listVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full"
        >
            {choices.map(choice => {
                const lockEntry = lockedMap[choice.id]
                const isLocked = !!lockEntry?.locked
                const reason = lockEntry?.reason

                return (
                    <motion.li
                        key={choice.id}
                        variants={itemVariants}
                        className="w-full"
                    >
                        <ChoiceCard
                            choice={choice}
                            onSelect={onSelect}
                            disabled={disabled}
                            isLocked={isLocked}
                            lockReason={reason}
                        />
                    </motion.li>
                )
            })}
        </motion.ul>
    )
}