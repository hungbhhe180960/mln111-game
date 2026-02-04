import type { Ending, GameState } from '../types/game.types'

export const ENDINGS: Ending[] = [
    // 1. BAD - Nhập viện
    {
        id: 'bad_ambulance',
        title: 'XE CẤP CỨU 115',
        description: 'Cơ thể bạn sụp đổ. Bạn ngất xỉu ngay trước giờ G. Nguyên nhân: Sức khỏe cạn kiệt hoặc thức trắng quá 2 đêm liên tiếp.',
        achievements: ['hospitalized_once'],
        condition: (state: GameState) => {
            // Chỉ nhập viện nếu:
            // 1. Máu về 0
            // 2. Hoặc đã thức trắng >= 2 đêm (sleepless_count >= 2)
            return state.stats.health <= 0 || state.stats.sleepless_count >= 2
        },
    },

    // 2. BAD - Bị bắt gian lận
    {
        id: 'bad_cheat',
        title: 'ĐÌNH CHỈ THI',
        description: 'Giám thị phát hiện tài liệu. Biên bản được lập. Môn học hủy.',
        achievements: ['cheat_caught'],
        condition: (state: GameState) => !!state.flags.cheat_caught
    },

    // 3. GOOD - Thủ khoa
    {
        id: 'good_valedictorian',
        title: 'THỦ KHOA MÔN TRIẾT',
        description: 'Bạn làm bài xuất sắc. A+ trong tầm tay.',
        achievements: ['perfect_student'],
        condition: (state: GameState) => state.stats.knowledge >= 90
    },

    // 4. NORMAL - Qua môn
    {
        id: 'normal_pass',
        title: 'QUA MÔN AN TOÀN',
        description: 'Vừa đủ điểm qua. Hú hồn.',
        achievements: ['survivor'],
        condition: (state: GameState) => state.stats.knowledge >= 50 && state.stats.knowledge < 90
    },

    // 5. BAD - Trượt môn
    {
        id: 'bad_fail',
        title: 'HỌC LẠI',
        description: 'Kiến thức không đủ. Hẹn gặp lại kỳ sau.',
        achievements: [],
        condition: (state: GameState) => state.stats.knowledge < 50
    }
]

export const checkEnding = (state: GameState): Ending | null => {
    for (const end of ENDINGS) {
        try {
            if (end.condition(state)) return end
        } catch {}
    }
    return null
}