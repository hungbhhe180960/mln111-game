import type { GameState } from '../types/game.types'

/* =========================
   ACHIEVEMENT TYPE
   ========================= */
export type Achievement = {
    readonly id: string
    readonly name: string
    readonly description: string
    readonly icon?: string

    /**
     * Runtime condition
     * Evaluated ONLY against final GameState
     * Must be PURE & SIDE-EFFECT FREE
     */
    readonly condition: (state: GameState) => boolean
}

/* =========================
   ACHIEVEMENT DEFINITIONS
   ========================= */
export const ACHIEVEMENTS: readonly Achievement[] = [
    {
        id: 'iron_will',
        name: 'Ý Chí Sắt Đá',
        description: 'Từ chối tất cả cám dỗ (không party, không lazy start)',
        icon: '🛡️',
        condition: (state) => {
            const flags = state.flags ?? {}

            return (
                !!flags.iron_discipline &&
                !flags.party_animal &&
                !flags.lazy_start
            )
        },
    },

    {
        id: 'perfect_student',
        name: 'Perfect Student',
        description: 'Knowledge > 80 và giữ sức khỏe tốt đến cuối (Health > 50)',
        icon: '🎓',
        condition: (state) =>
            state.stats.knowledge > 80 &&
            state.stats.health > 50,
    },

    {
        id: 'philosopher_path',
        name: "Philosopher's Path",
        description: 'Hiểu sâu triết học (deep understanding hoặc teacher guidance)',
        icon: '📜',
        condition: (state) => {
            const flags = state.flags ?? {}
            return !!flags.deep_understanding || !!flags.teacher_guidance
        },
    },

    {
        id: 'lucky_cheater',
        name: 'Kẻ Lừa Dối May Mắn',
        description: 'Qua môn nhờ phao (cheat thành công)',
        icon: '🤫',
        condition: (state) => {
            const flags = state.flags ?? {}
            return !!flags.has_cheat_sheet && !!flags.cheat_success
        },
    },

    {
        id: 'cheat_caught',
        name: 'Cái Giá Của Tự Do',
        description: 'Bị bắt gian lận trong kỳ thi',
        icon: '⚖️',
        condition: (state) => {
            const flags = state.flags ?? {}
            return flags.cheat_caught === true
        },
    },

    {
        id: 'miracle_survivor',
        name: 'Thánh Nhân Đãi Kẻ Khù Khờ',
        description: 'Khoanh bừa nhưng may mắn sống sót',
        icon: '🍀',
        condition: (state) => {
            const flags = state.flags ?? {}
            return !!flags.miracle_survivor || !!flags.lucky_guess
        },
    },

    {
        id: 'survivor',
        name: 'Survivor',
        description: 'Qua môn an toàn (Knowledge từ 50 đến 79)',
        icon: '✅',
        condition: (state) =>
            state.stats.knowledge >= 50 &&
            state.stats.knowledge <= 79,
    },

    {
        id: 'hospitalized_once',
        name: 'Nhập Viện Giữa Chừng',
        description: 'Đã từng nhập viện ít nhất một lần',
        icon: '🏥',
        condition: (state) => {
            const flags = state.flags ?? {}
            return (
                !!flags.hospitalized_day3 ||
                !!flags.hospitalized_day5 ||
                !!flags.hospitalized_day6
            )
        },
    },
] as const

export default ACHIEVEMENTS
