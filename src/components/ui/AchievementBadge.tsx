import type { Achievement } from '../../data/achievements'

type Props = {
    achievement: Achievement
    className?: string
}

/**
 * Small badge used in EndingScreen / showcase
 */
export default function AchievementBadge({ achievement, className = '' }: Props) {
    return (
        <div className={`flex items-center gap-3 bg-white/6 p-3 rounded-md ${className}`}>
            <div className="w-10 h-10 rounded-full bg-primary/80 flex items-center justify-center text-lg">{achievement.icon}</div>
            <div>
                <div className="text-sm font-semibold">{achievement.name}</div>
                <div className="text-xs text-neutral-300">{achievement.description}</div>
            </div>
        </div>
    )
}