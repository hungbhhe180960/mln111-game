import type { Event } from '../types/game.types'

/**
 * FILE SỰ KIỆN - PHIÊN BẢN FIX LOGIC & LOOP
 * - Day 2: Rõ ràng lựa chọn bạn gái.
 * - Day 3->4: Ngủ hồi phục Health mạnh và reset Sleepless.
 * - Day 5: Thi thử auto result dựa trên stats.
 * - Day 7: Logic vào phòng thi không bị loop.
 */

export const EVENTS: Record<string, Event> = {
    // ================= DAY 1 =================
    day1_start: {
        id: 'day1_start',
        day: 1,
        time: '08:00',
        title: 'Day 1 - Sáng Thứ Hai',
        description: 'Chỉ còn 7 ngày nữa là thi Triết học Mác - Lênin.',
        narration: 'Tiếng chuông báo thức réo rắt. Giáo trình dày cộp đang nằm trên bàn. Bạn sẽ bắt đầu thế nào?',
        bgImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80',
        choices: [
            { id: 'd1_calm', text: 'Lập kế hoạch ôn thi (4h)', effects: { stress: -5, knowledge: 5, time: 4 }, flags: ['focused_start'], nextEvent: 'day1_noon' },
            { id: 'd1_lazy', text: 'Ngủ nướng thêm (4h)', effects: { health: 10, knowledge: -2, time: 4 }, flags: ['lazy_start'], nextEvent: 'day1_noon' },
            { id: 'd1_hard', text: 'Lao vào học ngay (4h)', effects: { stress: 15, knowledge: 8, health: -5, time: 4 }, flags: ['hardcore_start'], nextEvent: 'day1_noon' }
        ]
    },
    day1_noon: {
        id: 'day1_noon',
        day: 1,
        time: '12:00',
        title: 'Trưa Day 1',
        narration: 'Bụng đói cồn cào. Bạn xuống canteen.',
        choices: [
            { id: 'd1_noon_full', text: 'Ăn suất đầy đủ (2h)', effects: { health: 10, money: -30000, time: 2 }, nextEvent: 'day1_afternoon' },
            { id: 'd1_noon_bread', text: 'Bánh mì cầm hơi (2h)', effects: { health: -5, money: -10000, knowledge: 5, time: 2 }, nextEvent: 'day1_afternoon' }
        ]
    },
    day1_afternoon: {
        id: 'day1_afternoon',
        day: 1,
        time: '14:00',
        title: 'Chiều Day 1',
        narration: 'Bạn bè rủ đi Net. Thư viện thì đang vắng.',
        choices: [
            { id: 'd1_lib', text: 'Vào thư viện học (5h)', effects: { knowledge: 12, stress: 10, time: 5 }, nextEvent: 'day1_evening' },
            { id: 'd1_game', text: 'Đi Net xả stress (5h)', effects: { stress: -20, money: -30000, knowledge: -2, time: 5 }, flags: ['party_animal'], nextEvent: 'day1_evening' }
        ]
    },
    day1_evening: {
        id: 'day1_evening',
        day: 1,
        time: '19:00',
        title: 'Tối Day 1',
        narration: 'Kết thúc ngày đầu tiên.',
        choices: [
            { id: 'd1_eve_review', text: 'Ôn bài nhẹ nhàng (5h)', effects: { knowledge: 5, time: 5 }, nextEvent: 'day1_midnight_trigger' }
        ]
    },
    day1_midnight_trigger: { id: 'day1_midnight_trigger', day: 1, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 2 (FIXED OPTIONS) =================
    day2_start: {
        id: 'day2_start',
        day: 2,
        time: '08:00',
        title: 'Day 2 - Tin đồn',
        narration: 'Có tin đồn thầy sẽ ra đề vào phần "Vật chất và Ý thức".',
        choices: [
            { id: 'd2_focus', text: 'Học tủ phần đó (4h)', effects: { knowledge: 15, stress: 15, time: 4 }, nextEvent: 'day2_noon' },
            { id: 'd2_ignore', text: 'Kệ, học phần khác (4h)', effects: { knowledge: 10, stress: 5, time: 4 }, flags: ['missed_material_topic'], nextEvent: 'day2_noon' }
        ]
    },
    day2_noon: {
        id: 'day2_noon',
        day: 2,
        time: '12:00',
        title: 'Trưa Day 2',
        narration: 'Nghỉ ngơi một chút.',
        choices: [
            { id: 'd2_chill', text: 'Nghe nhạc (2h)', effects: { stress: -10, time: 2 }, nextEvent: 'day2_afternoon' }
        ]
    },
    day2_afternoon: {
        id: 'day2_afternoon',
        day: 2,
        time: '14:00',
        title: 'Chiều Day 2',
        narration: 'Cơn buồn ngủ ập đến.',
        choices: [
            { id: 'd2_nap', text: 'Ngủ trưa (5h)', effects: { health: 10, stress: -5, time: 5 }, nextEvent: 'day2_evening' },
            { id: 'd2_coffee', text: 'Uống cafe cày tiếp (5h)', effects: { health: -5, knowledge: 8, time: 5 }, flags: ['caffeine_addict'], nextEvent: 'day2_evening' }
        ]
    },
    day2_evening: {
        id: 'day2_evening',
        day: 2,
        time: '19:00', // Đã chỉnh giờ về 19:00
        title: 'Tối Day 2 - Cuộc gọi từ người yêu',
        narration: 'Điện thoại rung. Người yêu gọi video call, muốn tâm sự chuyện trên trời dưới biển.',
        choices: [
            {
                id: 'd2_simp',
                text: 'Nghe máy & Tám chuyện (Mất 4 tiếng)',
                effects: { stress: -30, knowledge: -10, time: 4 },
                flags: ['crush_distracted'],
                nextEvent: 'day2_midnight_trigger'
            },
            {
                id: 'd2_sigma',
                text: 'Từ chối: "Anh bận học rồi" (Học 4 tiếng)',
                effects: { stress: 15, knowledge: 12, time: 4, flags: ['iron_will'] },
                nextEvent: 'day2_midnight_trigger'
            }
        ]
    },
    day2_midnight_trigger: { id: 'day2_midnight_trigger', day: 2, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 3 =================
    day3_start: {
        id: 'day3_start',
        day: 3,
        time: '08:00',
        title: 'Day 3 - Bão hòa',
        narration: 'Kiến thức vào tai nọ ra tai kia.',
        choices: [
            { id: 'd3_walk', text: 'Đi dạo (4h)', effects: { stress: -20, time: 4 }, nextEvent: 'day3_noon' },
            { id: 'd3_push', text: 'Cố học (4h)', effects: { stress: 20, knowledge: 10, time: 4 }, nextEvent: 'day3_noon' }
        ]
    },
    day3_noon: {
        id: 'day3_noon',
        day: 3,
        time: '12:00',
        title: 'Trưa Day 3',
        narration: 'Ăn uống qua loa.',
        choices: [
            { id: 'd3_eat', text: 'Ăn mì tôm (2h)', effects: { health: -5, time: 2 }, nextEvent: 'day3_afternoon' }
        ]
    },
    day3_afternoon: {
        id: 'day3_afternoon',
        day: 3,
        time: '14:00',
        title: 'Chiều Day 3 - Sự cố',
        narration: 'Mất điện toàn khu kí túc xá. Nóng không chịu nổi.',
        choices: [
            { id: 'd3_out', text: 'Ra quán cafe học (5h)', effects: { money: -25000, knowledge: 10, time: 5 }, nextEvent: 'day3_evening' },
            { id: 'd3_candle', text: 'Chịu nóng ngồi trong phòng (5h)', effects: { health: -10, knowledge: 5, time: 5 }, nextEvent: 'day3_evening' }
        ]
    },
    day3_evening: {
        id: 'day3_evening',
        day: 3,
        time: '19:00',
        title: 'Tối Day 3',
        narration: 'Điện đã có lại. Tranh thủ học bù.',
        choices: [
            // FIX SLEEP LOGIC: Ngủ tối nay hồi phục mạnh
            {
                id: 'd3_sleep_early',
                text: 'Đi ngủ sớm phục hồi sức khỏe (Ngủ 9 tiếng)',
                effects: { health: 40, stress: -30, sleepless_count: -10, time: 9 }, // Reset sleepless
                nextEvent: 'day3_midnight_trigger' // Sẽ trigger next day
            },
            {
                id: 'd3_grind',
                text: 'Cày đêm (5h)',
                effects: { knowledge: 10, health: -10, stress: 10, time: 5 },
                nextEvent: 'day3_midnight_trigger'
            }
        ]
    },
    day3_midnight_trigger: { id: 'day3_midnight_trigger', day: 3, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 4 (FIXED LOOP & DUPLICATES) =================
    day4_start: {
        id: 'day4_start',
        day: 4,
        time: '08:00',
        title: 'Day 4 - Triết học Mác',
        narration: 'Hôm nay tập trung vào các cặp phạm trù. Đây là kiến thức cốt lõi.',
        choices: [
            { id: 'd4_deep', text: 'Học hiểu bản chất (4h)', effects: { knowledge: 20, stress: 10, time: 4 }, flags: ['deep_understanding'], nextEvent: 'day4_noon' },
            { id: 'd4_skim', text: 'Học vẹt khái niệm (4h)', effects: { knowledge: 10, stress: 5, time: 4 }, flags: ['surface_learning'], nextEvent: 'day4_noon' }
        ]
    },
    day4_noon: {
        id: 'day4_noon',
        day: 4,
        time: '12:00',
        title: 'Trưa Day 4',
        narration: 'Nghỉ ngơi.',
        choices: [{ id: 'd4_rest', text: 'Chợp mắt (2h)', effects: { health: 5, time: 2 }, nextEvent: 'day4_afternoon' }]
    },
    // Đã xóa event mất điện trùng lặp ở đây
    day4_afternoon: {
        id: 'day4_afternoon',
        day: 4,
        time: '14:00',
        title: 'Chiều Day 4 - Thắc mắc',
        narration: 'Gặp vấn đề khó hiểu về Phủ định của phủ định.',
        choices: [
            { id: 'd4_ask', text: 'Email hỏi thầy (5h)', effects: { knowledge: 15, time: 5 }, flags: ['teacher_guidance'], nextEvent: 'day4_evening' },
            { id: 'd4_skip', text: 'Bỏ qua (5h)', effects: { stress: -5, time: 5 }, flags: ['knowledge_gap'], nextEvent: 'day4_evening' }
        ]
    },
    day4_evening: {
        id: 'day4_evening',
        day: 4,
        time: '19:00',
        title: 'Tối Day 4',
        narration: 'Một ngày học tập hiệu quả (hoặc không).',
        choices: [
            {
                id: 'd4_sleep',
                text: 'Ngủ sớm giữ sức (5h)',
                effects: { health: 30, stress: -20, sleepless_count: -10, time: 5 }, // Reset sleepless
                nextEvent: 'day4_midnight_trigger'
            },
            {
                id: 'd4_study',
                text: 'Học thêm chút nữa (5h)',
                effects: { knowledge: 8, health: -10, time: 5 },
                nextEvent: 'day4_midnight_trigger'
            }
        ]
    },
    day4_midnight_trigger: { id: 'day4_midnight_trigger', day: 4, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 5 (MOCK EXAM LOGIC) =================
    day5_start: {
        id: 'day5_start',
        day: 5,
        time: '08:00',
        title: 'Day 5 - Cám dỗ',
        narration: 'Có người bán phao thi ở cổng sau.',
        choices: [
            { id: 'd5_buy', text: 'Mua phao 50k (4h)', effects: { money: -50000, time: 4 }, flags: ['has_cheat_sheet'], nextEvent: 'day5_noon' },
            { id: 'd5_no', text: 'Không mua (4h)', effects: { knowledge: 5, time: 4 }, flags: ['integrity'], nextEvent: 'day5_noon' }
        ]
    },
    day5_noon: {
        id: 'day5_noon',
        day: 5,
        time: '12:00',
        title: 'Trưa Day 5',
        narration: 'Ăn trưa.',
        choices: [{ id: 'd5_lunch', text: 'Ăn cơm (2h)', effects: { health: 5, time: 2 }, nextEvent: 'day5_mock_test' }]
    },
    // AUTO ASSIGN RESULT DỰA VÀO STATS (Sử dụng tính năng condition của Choice)
    day5_mock_test: {
        id: 'day5_mock_test',
        day: 5,
        time: '14:00',
        title: 'Chiều Day 5 - THI THỬ',
        narration: 'Bạn tìm được một đề thi cũ năm ngoái và ngồi làm thử. Sau 2 tiếng toát mồ hôi, bạn so đáp án...',
        choices: [
            {
                id: 'd5_result_good',
                text: 'Kết quả: Rất tốt! (>80%)',
                effects: { stress: -10, consciousness: 10, time: 2 },
                condition: (s) => s.stats.knowledge >= 80, // Chỉ hiện nếu giỏi
                nextEvent: 'day5_evening'
            },
            {
                id: 'd5_result_avg',
                text: 'Kết quả: Tàm tạm (50-79%)',
                effects: { stress: 5, time: 2 },
                condition: (s) => s.stats.knowledge >= 50 && s.stats.knowledge < 80, // Chỉ hiện nếu khá
                nextEvent: 'day5_evening'
            },
            {
                id: 'd5_result_bad',
                text: 'Kết quả: Quá tệ... (<50%)',
                effects: { stress: 20, consciousness: -10, time: 2 },
                condition: (s) => s.stats.knowledge < 50, // Chỉ hiện nếu kém
                nextEvent: 'day5_evening'
            }
        ]
    },
    day5_evening: {
        id: 'day5_evening',
        day: 5,
        time: '16:00', // Sau thi thử
        title: 'Tối Day 5 - Hậu quả',
        narration: 'Kết quả thi thử làm bạn suy nghĩ nhiều.',
        choices: [
            { id: 'd5_relax', text: 'Nghỉ ngơi lấy lại tinh thần (6h)', effects: { stress: -10, time: 6 }, nextEvent: 'day5_midnight_trigger' },
            { id: 'd5_push', text: 'Học bù lại phần chưa biết (6h)', effects: { knowledge: 10, health: -10, time: 6 }, nextEvent: 'day5_midnight_trigger' }
        ]
    },
    day5_midnight_trigger: { id: 'day5_midnight_trigger', day: 5, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 6 =================
    day6_start: {
        id: 'day6_start',
        day: 6,
        time: '08:00',
        title: 'Day 6 - Ngày cuối cùng',
        narration: 'Chỉ còn 24h nữa.',
        choices: [
            { id: 'd6_cram', text: 'Nhồi nhét kiến thức (4h)', effects: { knowledge: 20, health: -20, time: 4 }, flags: ['cramming_final'], nextEvent: 'day6_noon' },
            { id: 'd6_chill', text: 'Thư giãn giữ sức (4h)', effects: { health: 10, stress: -20, time: 4 }, nextEvent: 'day6_noon' }
        ]
    },
    day6_noon: {
        id: 'day6_noon',
        day: 6,
        time: '12:00',
        title: 'Trưa Day 6',
        narration: 'Ăn uống cẩn thận.',
        choices: [
            { id: 'd6_eat', text: 'Ăn cháo (2h)', effects: { health: 5, time: 2 }, nextEvent: 'day6_afternoon' }
        ]
    },
    day6_afternoon: {
        id: 'day6_afternoon',
        day: 6,
        time: '14:00',
        title: 'Chiều Day 6',
        narration: 'Chuẩn bị đồ đạc.',
        choices: [
            { id: 'd6_prep', text: 'Soạn bút, thẻ SV (5h)', effects: { stress: -10, time: 5 }, nextEvent: 'day6_evening' }
        ]
    },
    day6_evening: {
        id: 'day6_evening',
        day: 6,
        time: '19:00',
        title: 'Đêm trước ngày thi',
        narration: 'Quyết định quan trọng nhất: Ngủ hay Thức?',
        choices: [
            {
                id: 'd6_sleep',
                text: 'Ngủ sớm (Ngủ 8 tiếng)',
                effects: { health: 20, stress: -20, sleepless_count: -10, time: 8 }, // Reset sleepless để mai tỉnh táo
                nextEvent: 'day6_midnight_trigger'
            },
            {
                id: 'd6_all_in',
                text: 'All-in: Thức trắng đêm nay (9h)',
                effects: { knowledge: 30, health: -40, sleepless_count: 1, time: 9 }, // Chắc chắn dính sleepless
                flags: ['all_in_final_night'],
                nextEvent: 'day6_midnight_trigger'
            }
        ]
    },
    day6_midnight_trigger: { id: 'day6_midnight_trigger', day: 6, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 7 (FIXED LOGIC) =================
    // Luồng: day7_start (08:00) -> choice -> day7_exam_start (08:30) -> App.tsx switch screen
    day7_start: {
        id: 'day7_start',
        day: 7,
        time: '08:00',
        title: 'DAY 7 - NGÀY PHÁN XÉT',
        narration: 'Bạn đứng trước cửa phòng thi. Tim đập thình thịch.',
        bgImage: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80',
        choices: [
            {
                id: 'd7_enter_confident',
                text: 'Tự tin bước vào (Vì đã ôn kỹ)',
                effects: { stress: -5, time: 0.5 }, // +30p -> 08:30
                condition: (s) => s.stats.knowledge >= 70,
                nextEvent: 'day7_exam_start'
            },
            {
                id: 'd7_enter_nervous',
                text: 'Run rẩy bước vào (Kiến thức hổng)',
                effects: { stress: 10, time: 0.5 },
                condition: (s) => s.stats.knowledge < 70,
                nextEvent: 'day7_exam_start'
            },
            {
                id: 'd7_prepare_cheat',
                text: 'Lén lút chuẩn bị phao thi',
                effects: { stress: 20, time: 0.5 },
                condition: (s) => !!s.flags.has_cheat_sheet, // Chỉ hiện nếu có phao
                nextEvent: 'day7_exam_start'
            }
        ]
    },
    // Event này là điểm dừng để App.tsx bắt được time='08:30'
    day7_exam_start: {
        id: 'day7_exam_start',
        day: 7,
        time: '08:30',
        title: 'Đã vào phòng thi',
        narration: 'Giám thị bắt đầu phát đề...',
        choices: [] // Không có choice nào, màn hình sẽ đứng yên cho đến khi App.tsx chuyển cảnh
    }
}