import type { Event } from '../types/game.types'

/**
 * FILE SỰ KIỆN - PHIÊN BẢN FIX LỖI DAY 2 & LOGIC FLOW
 */

export const EVENTS: Record<string, Event> = {
    // ================= DAY 1 =================
    day1_start: {
        id: 'day1_start',
        day: 1,
        time: '08:00',
        title: 'Day 1 - Khởi Động',
        description: 'Chỉ còn 7 ngày nữa là thi.',
        narration: 'Mắt nhắm mắt mở. Giáo trình Triết học dày cộp đang nằm trên bàn. Bắt đầu thôi.',
        bgImage: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&q=80',
        choices: [
            { id: 'd1_calm', text: 'Lập kế hoạch (4h)', effects: { stress: -5, knowledge: 3, time: 4 }, flags: ['focused_start'], nextEvent: 'day1_noon' },
            { id: 'd1_lazy', text: 'Ngủ nướng (4h)', effects: { health: 10, knowledge: -3, time: 4 }, flags: ['lazy_start'], nextEvent: 'day1_noon' },
            { id: 'd1_hard', text: 'Học ngay (4h)', effects: { stress: 15, knowledge: 5, health: -5, time: 4 }, flags: ['hardcore_start'], nextEvent: 'day1_noon' }
        ]
    },
    day1_noon: {
        id: 'day1_noon',
        day: 1,
        time: '12:00',
        title: 'Trưa Day 1',
        narration: 'Bụng đói cồn cào. Xuống canteen hay gặm bánh mì?',
        choices: [
            { id: 'd1_noon_full', text: 'Ăn suất đầy đủ (2h)', effects: { health: 10, money: -30000, time: 2 }, nextEvent: 'day1_afternoon' },
            { id: 'd1_noon_bread', text: 'Gặm bánh mì 10k (2h)', effects: { health: -5, money: -10000, knowledge: 1, time: 2 }, nextEvent: 'day1_afternoon' }
        ]
    },
    day1_afternoon: {
        id: 'day1_afternoon',
        day: 1,
        time: '14:00',
        title: 'Chiều Day 1 - Cám dỗ',
        narration: 'Bạn bè rủ đi Net. Thư viện thì đang vắng.',
        choices: [
            { id: 'd1_lib', text: 'Vào thư viện học (5h)', effects: { knowledge: 6, stress: 10, time: 5 }, nextEvent: 'day1_evening' },
            { id: 'd1_game', text: 'Đi Net xả stress (5h)', effects: { stress: -20, money: -30000, knowledge: -5, time: 5 }, flags: ['party_animal'], nextEvent: 'day1_evening' }
        ]
    },
    day1_evening: {
        id: 'day1_evening',
        day: 1,
        time: '19:00',
        title: 'Tối Day 1',
        narration: 'Kết thúc ngày đầu tiên.',
        choices: [
            { id: 'd1_eve_review', text: 'Ôn bài nhẹ nhàng (5h)', effects: { knowledge: 3, time: 5 }, nextEvent: 'day1_midnight_trigger' }
        ]
    },
    day1_midnight_trigger: { id: 'day1_midnight_trigger', day: 1, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 2 (FIXED) =================
    day2_start: {
        id: 'day2_start',
        day: 2,
        time: '08:00',
        title: 'Day 2 - Tin đồn',
        narration: 'Tin đồn thầy sẽ ra đề vào phần "Vật chất và Ý thức". Bạn chưa học gì phần này.',
        choices: [
            { id: 'd2_focus', text: 'Học tủ phần đó (4h)', effects: { knowledge: 8, stress: 15, time: 4 }, nextEvent: 'day2_noon' },
            { id: 'd2_ignore', text: 'Kệ, học phần khác (4h)', effects: { knowledge: 4, stress: 5, time: 4 }, flags: ['missed_material_topic'], nextEvent: 'day2_noon' }
        ]
    },
    day2_noon: {
        id: 'day2_noon',
        day: 2,
        time: '12:00',
        title: 'Trưa Day 2',
        narration: 'Nghỉ ngơi.',
        choices: [{ id: 'd2_chill', text: 'Nghe nhạc (2h)', effects: { stress: -5, time: 2 }, nextEvent: 'day2_afternoon' }]
    },
    day2_afternoon: {
        id: 'day2_afternoon',
        day: 2,
        time: '14:00',
        title: 'Chiều Day 2',
        narration: 'Buổi chiều oi ả, cơn buồn ngủ ập đến.',
        choices: [
            { id: 'd2_nap', text: 'Ngủ trưa (5h)', effects: { health: 10, stress: -5, time: 5 }, nextEvent: 'day2_evening' },
            { id: 'd2_coffee', text: 'Uống bò húc cày tiếp (5h)', effects: { health: -10, stress: 10, knowledge: 7, time: 5 }, flags: ['caffeine_addict'], nextEvent: 'day2_evening' }
        ]
    },
    // 🟢 ĐÃ SỬA: Option d2_sigma không còn flags trong effects
    day2_evening: {
        id: 'day2_evening',
        day: 2,
        time: '19:00',
        title: 'Tối Day 2 - Crush',
        narration: 'Crush gọi điện muốn tâm sự chuyện trên trời dưới biển.',
        choices: [
            {
                id: 'd2_simp',
                text: 'Nghe máy (Mất 4 tiếng)',
                effects: { stress: -25, knowledge: -8, time: 4 },
                flags: ['crush_distracted'],
                nextEvent: 'day2_midnight_trigger'
            },
            {
                id: 'd2_sigma',
                text: 'Từ chối: "Anh bận học rồi" (4h)',
                effects: { stress: 15, knowledge: 8, time: 4 }, // 🟢 Đã sửa
                flags: ['iron_will'], // 🟢 Đã sửa - đưa ra ngoài effects
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
        title: 'Day 3 - Stress',
        narration: 'Kiến thức vào tai nọ ra tai kia.',
        choices: [
            { id: 'd3_walk', text: 'Đi dạo công viên (4h)', effects: { stress: -20, knowledge: -2, time: 4 }, nextEvent: 'day3_noon' },
            { id: 'd3_push', text: 'Ép bản thân học (4h)', effects: { stress: 25, knowledge: 8, health: -5, time: 4 }, nextEvent: 'day3_noon' }
        ]
    },
    day3_noon: {
        id: 'day3_noon',
        day: 3,
        time: '12:00',
        title: 'Trưa Day 3 - Hết tiền',
        narration: 'Ví tiền vơi dần.',
        choices: [
            { id: 'd3_eat', text: 'Mì tôm 3k (2h)', effects: { health: -10, money: -3000, time: 2 }, nextEvent: 'day3_afternoon' },
            { id: 'd3_borrow', text: 'Vay tiền bạn (2h)', effects: { money: 100000, stress: 5, time: 2 }, nextEvent: 'day3_afternoon' }
        ]
    },
    day3_afternoon: {
        id: 'day3_afternoon',
        day: 3,
        time: '14:00',
        title: 'Chiều Day 3 - Sự cố',
        narration: 'Mất điện toàn khu kí túc xá. Nóng như đổ lửa.',
        choices: [
            { id: 'd3_out', text: 'Ra quán cafe học (5h)', effects: { money: -30000, knowledge: 8, time: 5 }, nextEvent: 'day3_evening' },
            { id: 'd3_candle', text: 'Chịu nóng ngồi phòng (5h)', effects: { health: -15, knowledge: 4, time: 5 }, nextEvent: 'day3_evening' }
        ]
    },
    day3_evening: {
        id: 'day3_evening',
        day: 3,
        time: '19:00',
        title: 'Tối Day 3',
        narration: 'Có điện lại rồi.',
        choices: [
            { id: 'd3_sleep', text: 'Ngủ sớm hồi phục (5h)', effects: { health: 30, stress: -20, sleepless_count: -100, time: 5 }, nextEvent: 'day3_midnight_trigger' },
            { id: 'd3_grind', text: 'Cày đêm bù giờ (5h)', effects: { knowledge: 6, health: -10, stress: 10, time: 5 }, nextEvent: 'day3_midnight_trigger' }
        ]
    },
    day3_midnight_trigger: { id: 'day3_midnight_trigger', day: 3, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 4 =================
    day4_start: {
        id: 'day4_start',
        day: 4,
        time: '08:00',
        title: 'Day 4 - Triết học Mác',
        narration: 'Hôm nay tập trung vào các cặp phạm trù khó nhằn.',
        choices: [
            { id: 'd4_deep', text: 'Học hiểu bản chất (4h)', effects: { knowledge: 15, stress: 15, time: 4 }, flags: ['deep_understanding'], nextEvent: 'day4_noon' },
            { id: 'd4_skim', text: 'Học vẹt khái niệm (4h)', effects: { knowledge: 7, stress: 5, time: 4 }, flags: ['surface_learning'], nextEvent: 'day4_noon' }
        ]
    },
    day4_noon: {
        id: 'day4_noon',
        day: 4,
        time: '12:00',
        title: 'Trưa Day 4',
        narration: 'Ngủ gục trên bàn.',
        choices: [{ id: 'd4_rest', text: 'Chợp mắt tí (2h)', effects: { health: 5, time: 2 }, nextEvent: 'day4_afternoon' }]
    },
    day4_afternoon: {
        id: 'day4_afternoon',
        day: 4,
        time: '14:00',
        title: 'Chiều Day 4 - Thắc mắc',
        narration: 'Gặp phần khó hiểu.',
        choices: [
            { id: 'd4_ask', text: 'Email hỏi thầy (5h)', effects: { knowledge: 10, time: 5 }, flags: ['teacher_guidance'], nextEvent: 'day4_evening' },
            { id: 'd4_skip', text: 'Bỏ qua học cái dễ (5h)', effects: { stress: -5, time: 5 }, flags: ['knowledge_gap'], nextEvent: 'day4_evening' }
        ]
    },
    day4_evening: {
        id: 'day4_evening',
        day: 4,
        time: '19:00',
        title: 'Tối Day 4',
        narration: 'Mệt mỏi rã rời.',
        choices: [
            { id: 'd4_sleep', text: 'Ngủ sớm (5h)', effects: { health: 25, stress: -15, sleepless_count: -100, time: 5 }, nextEvent: 'day4_midnight_trigger' },
            { id: 'd4_study', text: 'Cố học thêm (5h)', effects: { knowledge: 5, health: -10, time: 5 }, nextEvent: 'day4_midnight_trigger' }
        ]
    },
    day4_midnight_trigger: { id: 'day4_midnight_trigger', day: 4, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 5 =================
    day5_start: {
        id: 'day5_start',
        day: 5,
        time: '08:00',
        title: 'Day 5 - Cám dỗ Phao thi',
        narration: 'Có người bán phao thi xịn ở cổng sau.',
        choices: [
            { id: 'd5_buy', text: 'Mua phao (50k) (4h)', effects: { money: -50000, time: 4 }, flags: ['has_cheat_sheet'], nextEvent: 'day5_noon' },
            { id: 'd5_no', text: 'Không mua (4h)', effects: { knowledge: 3, time: 4 }, flags: ['integrity'], nextEvent: 'day5_noon' }
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
    day5_mock_test: {
        id: 'day5_mock_test',
        day: 5,
        time: '14:00',
        title: 'Chiều Day 5 - THI THỬ',
        narration: 'Làm đề thi năm ngoái. Kết quả là...',
        choices: [
            { id: 'd5_result_good', text: 'Tốt! (>70%)', effects: { stress: -10, time: 2 }, condition: (s) => s.stats.knowledge >= 70, nextEvent: 'day5_evening' },
            { id: 'd5_result_avg', text: 'Tàm tạm (40-69%)', effects: { stress: 5, time: 2 }, condition: (s) => s.stats.knowledge >= 40 && s.stats.knowledge < 70, nextEvent: 'day5_evening' },
            { id: 'd5_result_bad', text: 'Quá tệ... (<40%)', effects: { stress: 20, time: 2 }, condition: (s) => s.stats.knowledge < 40, nextEvent: 'day5_evening' }
        ]
    },
    day5_evening: {
        id: 'day5_evening',
        day: 5,
        time: '16:00',
        title: 'Tối Day 5',
        narration: 'Hoang mang sau bài thi thử.',
        choices: [
            { id: 'd5_relax', text: 'Nghỉ ngơi (6h)', effects: { stress: -5, time: 6 }, nextEvent: 'day5_midnight_trigger' },
            { id: 'd5_push', text: 'Học bù (6h)', effects: { knowledge: 7, health: -10, time: 6 }, nextEvent: 'day5_midnight_trigger' }
        ]
    },
    day5_midnight_trigger: { id: 'day5_midnight_trigger', day: 5, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 6 =================
    day6_start: {
        id: 'day6_start',
        day: 6,
        time: '08:00',
        title: 'Day 6 - Ngày cuối cùng',
        narration: 'Cơ hội cuối cùng.',
        choices: [
            { id: 'd6_cram', text: 'Nhồi nhét (4h)', effects: { knowledge: 15, health: -20, stress: 30, time: 4 }, flags: ['cramming_final'], nextEvent: 'day6_noon' },
            { id: 'd6_chill', text: 'Thư giãn (4h)', effects: { health: 10, stress: -20, time: 4 }, nextEvent: 'day6_noon' }
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
        narration: 'Chuẩn bị hành trang.',
        choices: [
            { id: 'd6_prep', text: 'Soạn đồ (5h)', effects: { stress: -10, time: 5 }, nextEvent: 'day6_evening' }
        ]
    },
    day6_evening: {
        id: 'day6_evening',
        day: 6,
        time: '19:00',
        title: 'Đêm trước ngày thi',
        narration: 'All-in hay Ngủ sớm?',
        choices: [
            { id: 'd6_sleep', text: 'Ngủ sớm (8h)', effects: { health: 20, stress: -20, sleepless_count: -100, time: 8 }, nextEvent: 'day6_midnight_trigger' },
            { id: 'd6_all_in', text: 'All-in (9h)', effects: { knowledge: 20, health: -40, sleepless_count: 1, time: 9 }, flags: ['all_in_final_night'], nextEvent: 'day6_midnight_trigger' }
        ]
    },
    day6_midnight_trigger: { id: 'day6_midnight_trigger', day: 6, time: '24:00', title: '', narration: '', choices: [] },

    // ================= DAY 7 =================
    day7_start: {
        id: 'day7_start',
        day: 7,
        time: '08:00',
        title: 'DAY 7 - NGÀY PHÁN XÉT',
        narration: 'Đứng trước phòng thi. Lựa chọn chiến thuật?',
        bgImage: 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?auto=format&fit=crop&q=80',
        choices: [
            {
                id: 'd7_cheat',
                text: 'Dùng phao thi (Đã chuẩn bị)',
                effects: { stress: 20, time: 0.5 },
                condition: (s) => !!s.flags.has_cheat_sheet,
                nextEvent: 'day7_exam_start'
            },
            {
                id: 'd7_confident',
                text: 'Tự tin làm bài (Kiến thức đủ)',
                effects: { stress: -5, time: 0.5 },
                condition: (s) => s.stats.knowledge >= 50,
                nextEvent: 'day7_exam_start'
            },
            {
                id: 'd7_guess',
                text: 'Khoanh bừa cầu may (Kiến thức rỗng)',
                effects: { stress: 10, time: 0.5 },
                condition: (s) => s.stats.knowledge < 50,
                nextEvent: 'day7_exam_start'
            }
        ]
    },
    day7_exam_start: {
        id: 'day7_exam_start',
        day: 7,
        time: '08:30',
        title: 'Đang làm bài...',
        narration: '...',
        choices: [] // Handled by ExamScreen
    }
}