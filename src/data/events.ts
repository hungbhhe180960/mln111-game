import type { Event, GameState } from '../types/game.types'

/**
 * EVENTS registry for "Mùa ôn thi"
 *
 * Important implementation notes (do not change here):
 * - resolve_next_day is an ENGINE helper: the engine SHOULD intercept it and
 *   increment state.day (state.day += 1) and then route to the returned event.
 *   We keep conditional choices here as a safety-net for engines that evaluate
 *   choice.condition, but THESE CHOICES DO NOT increment day themselves.
 *
 * - sleepless_count in all events uses non-negative semantics:
 *     * sleep => sleepless_count: 0
 *     * stay awake => sleepless_count: 1
 *   The engine/store must APPLY these values (replace current sleepless_count),
 *   or handle them correctly (not add -9999 etc).
 *
 * - day2_afternoon now routes to a guaranteed day2_evening event (BẮT BUỘC).
 *   day2_evening always leads to day2_midnight. This avoids a broken flow if
 *   conditional events (e.g., crush) are skipped.
 *
 * - day3 has an evening router (day3_evening_router) to ensure day3_money_crisis
 *   can be reached safely.
 */

export const EVENTS: Record<string, Event> = {
    /**
     * ENGINE resolver for next day.
     *
     * The engine should intercept this event and:
     *  - increment state.day (state.day += 1)
     *  - compute target nextEvent according to state (and possibly flags)
     *  - set currentEventId to target event
     *
     * As a fallback for engines that still process choices, we include conditional
     * choices that point to the appropriate next-day event. Those choices should
     * NOT be relied on to increase state.day automatically.
     */
    resolve_next_day: {
        id: 'resolve_next_day',
        day: 0,
        time: '00:10',
        title: 'ENGINE: Resolve Next Day',
        description: 'Auto resolve next day based on current day.',
        narration: '',
        bgImage: '/images/resolve_placeholder.jpg',
        bgMusic: 'bgm_ambient_school',

        choices: [
            {
                id: 'to_day1',
                text: '[AUTO] Go to Day 1',
                condition: (state) => state.day === 1,
                nextEvent: 'day1_start',
            },
            {
                id: 'to_day2',
                text: '[AUTO] Go to Day 2',
                condition: (state) => state.day === 2,
                nextEvent: 'day2_start',
            },
            {
                id: 'to_day3',
                text: '[AUTO] Go to Day 3',
                condition: (state) => state.day === 3,
                nextEvent: 'day3_start',
            },
            {
                id: 'to_day4',
                text: '[AUTO] Go to Day 4',
                condition: (state) => state.day === 4,
                nextEvent: 'day4_start',
            },
            {
                id: 'to_day5',
                text: '[AUTO] Go to Day 5',
                condition: (state) => state.day === 5,
                nextEvent: 'day5_start',
            },
            {
                id: 'to_day6',
                text: '[AUTO] Go to Day 6',
                condition: (state) => state.day === 6,
                nextEvent: 'day6_start',
            },
            {
                id: 'to_day7',
                text: '[AUTO] Go to Day 7',
                condition: (state) => state.day === 7,
                nextEvent: 'day7_start',
            },
        ],
    },

    /**
     * DAY 1 - Start
     */
    day1_start: {
        id: 'day1_start',
        day: 1,
        time: '08:00',
        title: 'Ngày đầu tiên: Sự khởi đầu',
        description: 'Ký túc xá FPTU, 8:00 sáng. Bạn vừa nhận lịch thi MLN111 sau 7 ngày nữa...',
        narration: '7 ngày nữa thi Triết... Môn này nghe bảo khó. Giờ mình nên làm gì đây?',
        bgImage: '/images/day1_dorm.jpg',
        bgMusic: 'bgm_ambient_school',
        choices: [
            {
                id: 'day1_choice_lazy',
                text: 'Thôi làm trận game lấy tinh thần đã',
                effects: { stress: -10, consciousness: -20, health: -5 },
                flags: ['lazy_start'],
                nextEvent: 'day1_wifi_crisis',
            },
            {
                id: 'day1_choice_focused',
                text: 'Dọn dẹp bàn học, pha cafe, lên kế hoạch',
                effects: { consciousness: 15, stress: 5, health: 5, money: -15000 },
                flags: ['focused_start'],
                nextEvent: 'day1_wifi_crisis',
            },
            {
                id: 'day1_choice_hardcore',
                text: 'Lao vào đọc sách giáo trình ngay lập tức',
                effects: { knowledge: 15, stress: 25, health: -10, consciousness: 5 },
                flags: ['hardcore_start'],
                nextEvent: 'day1_wifi_crisis',
            },
        ],
    },

    /**
     * DAY 1 - WIFI CRISIS (18:00)
     */
    day1_wifi_crisis: {
        id: 'day1_wifi_crisis',
        day: 1,
        time: '18:00',
        title: 'WiFi KTX sự cố',
        description: 'Bạn định search tài liệu nhưng wifi KTX không vào được.',
        narration:
            "Bạn định tải tài liệu, nhưng mạng FPTU quay vòng vòng. Bực mình, nhưng còn cách khác để học.",
        bgImage: '/images/bg_wifi_issue.jpg',
        bgMusic: 'bgm_lofi_study',
        choices: [
            {
                id: 'day1_wifi_4g',
                text: 'Dùng 4G phát Hotspot để học',
                effects: { money: -50000, stress: 5, knowledge: 5, consciousness: 10 },
                nextEvent: 'day1_midnight',
            },
            {
                id: 'day1_wifi_relax',
                text: 'Thôi, mạng lag là điềm báo nên nghỉ',
                effects: { stress: -10, knowledge: -2, consciousness: -5 },
                flags: ['lazy_pattern_start'],
                nextEvent: 'day1_midnight',
            },
            {
                id: 'day1_wifi_library',
                text: 'Xuống thư viện đọc sách giấy (Old school)',
                effects: { health: -5, knowledge: 8, consciousness: 8 },
                nextEvent: 'day1_midnight',
            },
        ],
    },

    /**
     * DAY 1 - Midnight choices (00:00)
     *
     * Sleep uses sleepless_count: 0 (reset). Staying awake uses sleepless_count: 1.
     */
    day1_midnight: {
        id: 'day1_midnight',
        day: 1,
        time: '00:00',
        title: '00:00 - Đêm đầu tiên',
        description: 'Đêm đã về khuya. Bạn phải chọn ngủ hay thức học/giải trí.',
        narration: 'Đêm đã về khuya. Bạn cảm thấy...',
        bgImage: '/images/dorm_night.jpg',
        bgMusic: 'bgm_sleepy',
        choices: [
            {
                id: 'day1_mid_sleep',
                text: 'Đi ngủ (Sleep)',
                effects: { health: 25, stress: -10, sleepless_count: 0 },
                nextEvent: 'resolve_next_day',
            },
            {
                id: 'day1_mid_play',
                text: 'Thức chơi game/xem phim (Play)',
                effects: { stress: -25, health: -20, sleepless_count: 1, knowledge: -3 },
                flags: ['night_owl_pattern'],
                nextEvent: 'resolve_next_day',
            },
            {
                id: 'day1_mid_study',
                text: 'Cày đêm học bài (Study Hard)',
                effects: { knowledge: 18, health: -25, stress: 15, sleepless_count: 1, consciousness: 10 },
                flags: ['grinder_pattern'],
                nextEvent: 'resolve_next_day',
            },
        ],
    },

    /**
     * DAY 2 - Morning check (08:00)
     */
    day2_morning_check: {
        id: 'day2_morning_check',
        day: 2,
        time: '08:00',
        title: 'Ngày 2 - Check trạng thái đầu ngày',
        description:
            'Sáng hôm sau: trạng thái khác nhau tùy bạn đã thức hay ngủ. (Consciousness tạm thời +/-)',
        narration: 'Sáng sớm, bạn tỉnh dậy và kiểm tra cơ thể.',
        bgImage: '/images/day2_morning.jpg',
        bgMusic: 'bgm_morning_birds',
        choices: [
            {
                id: 'day2_morning_auto',
                text: 'Tiếp tục ngày (Hệ thống áp dụng debuff/bonus tự động)',
                effects: {},
                nextEvent: 'day2_main_event',
            },
        ],
    },

    /**
     * DAY 2 - Main event 09:00 - Material vs Will
     */
    day2_main_event: {
        id: 'day2_main_event',
        day: 2,
        time: '09:00',
        title: 'Vật chất quy định ý thức',
        description: 'Bàn học mở sẵn sách, nhưng thân/tâm bạn có đấu tranh.',
        narration: 'Bàn học đã mở sẵn sách. Nhưng cơ thể và tâm trí đấu tranh.',
        bgImage: '/images/study_table.jpg',
        bgMusic: 'bgm_lofi_study',
        choices: [
            {
                id: 'day2_choice_tiktok',
                text: 'Xem TikTok/Reels giải trí tí đã',
                effects: { stress: -15, knowledge: -5, consciousness: -15 },
                flags: ['procrastination_day2'],
                nextEvent: 'day2_afternoon',
            },
            {
                id: 'day2_choice_cafe',
                text: 'Pha cafe, nghe nhạc lofi, học từ từ',
                effects: { knowledge: 12, stress: 5, health: 5, consciousness: 15, money: -20000 },
                nextEvent: 'day2_afternoon',
            },
            {
                id: 'day2_choice_video',
                text: "Xem Youtube 'Tóm tắt Triết trong 10 phút'",
                effects: { knowledge: 8, consciousness: -5 },
                flags: ['surface_learning'],
                nextEvent: 'day2_afternoon',
            },
        ],
    },

    /**
     * DAY 2 - Afternoon (16:00)
     *
     * Removed inline Math.random to avoid re-roll issues. This event always leads to
     * day2_evening; later a router or flag can show crush-specific followups.
     */
    day2_afternoon: {
        id: 'day2_afternoon',
        day: 2,
        time: '16:00',
        title: 'Crush rep story (possible)',
        description: 'Điện thoại rung — có khả năng crush thả tim story của bạn.',
        narration: 'Điện thoại rung, một tương tác mạng xã hội xuất hiện.',
        bgImage: '/images/phone_notify.jpg',
        bgMusic: 'bgm_heartbeat',
        choices: [
            {
                id: 'day2_afternoon_continue_1',
                text: 'Tiếp tục buổi tối (lựa chọn 1)',
                effects: { stress: -10 },
                nextEvent: 'day2_evening',
            },
            {
                id: 'day2_afternoon_continue_2',
                text: 'Tiếp tục buổi tối (lựa chọn 2)',
                effects: { consciousness: 5 },
                nextEvent: 'day2_evening',
            },
            {
                id: 'day2_afternoon_continue_3',
                text: 'Tiếp tục buổi tối (lựa chọn 3)',
                effects: {},
                nextEvent: 'day2_evening',
            },
        ],
    },

    /**
     * DAY 2 - Evening (20:00) — BẮT BUỘC
     *
     * This event is a guaranteed router / transition point after day2_afternoon.
     * It always leads to day2_midnight (so the flow cannot get stuck).
     * If you need to insert crush-specific followups, put them here (e.g., check flags).
     */
    day2_evening: {
        id: 'day2_evening',
        day: 2,
        time: '20:00',
        title: 'Buổi tối ngày 2',
        description: 'Buổi tối sau khi học/ra ngoài — chuẩn bị cho đêm.',
        narration: '',
        bgImage: '/images/evening.jpg',
        bgMusic: 'bgm_ambient_school',
        choices: [
            {
                id: 'day2_evening_to_midnight',
                text: 'Kết thúc buổi tối, chuẩn bị đi ngủ/đêm',
                effects: {},
                nextEvent: 'day2_midnight',
            },
            // Optional router to a crush followup if flag is set (kept as conditional)
            {
                id: 'day2_evening_to_crush_check',
                text: '[AUTO] Nếu crush_distracted → ngày tiếp theo có event',
                condition: (state: GameState) => !!state.flags.crush_distracted,
                effects: {},
                nextEvent: 'day3_potential_date',
            },
        ],
    },

    /**
     * DAY 2 - Midnight (resolve to next morning)
     *
     * Sleep now sets sleepless_count: 0; staying awake sets sleepless_count: 1.
     */
    day2_midnight: {
        id: 'day2_midnight',
        day: 2,
        time: '00:00',
        title: 'Đêm thứ 2 - Quyết định',
        description: 'Bạn đã thức một số đêm; cẩn trọng nếu sleepless_count == 1.',
        narration: '00:00 - Đêm thứ 2. Lựa chọn của bạn sẽ ảnh hưởng đến nguy cơ nhập viện.',
        bgImage: '/images/night_choices.jpg',
        bgMusic: 'bgm_tension',
        choices: [
            {
                id: 'day2_mid_sleep',
                text: 'Đi ngủ',
                effects: { health: 25, stress: -10, sleepless_count: 0 },
                nextEvent: 'resolve_next_day',
            },
            {
                id: 'day2_mid_play',
                text: 'Cày phim/Chơi game xuyên đêm',
                effects: { stress: -25, health: -25, sleepless_count: 1 },
                nextEvent: 'resolve_next_day',
            },
            {
                id: 'day2_mid_study',
                text: 'Học xuyên màn đêm',
                effects: { knowledge: 20, health: -30, stress: 20, sleepless_count: 1 },
                nextEvent: 'resolve_next_day',
            },
        ],
    },

    /**
     * DAY 3 - Hospital check (08:00)
     */
    day3_hospital_check: {
        id: 'day3_hospital_check',
        day: 3,
        time: '08:00',
        title: 'HOSPITAL CHECK - Kiệt sức',
        description:
            'Bạn bất tỉnh/kiệt sức do thiếu ngủ hoặc sức khoẻ kém. Bị đưa tới phòng y tế, skip ngày.',
        narration:
            'Bạn vừa định ngồi dậy thì... mọi thứ quay cuồng. Bạn được đưa tới phòng y tế. Nghỉ tuyệt đối hôm nay.',
        bgImage: '/images/hospital_room.jpg',
        bgMusic: 'bgm_hospital',
        condition: (state: GameState) => state.stats.sleepless_count >= 2 || state.stats.health <= 0,
        choices: [
            {
                id: 'day3_hospital_accept',
                text: 'Chấp nhận truyền nước & nghỉ ngơi',
                // reset sleepless_count to 0 after hospital
                effects: { health: -50, knowledge: -10, stress: 25, money: -100000, sleepless_count: 0 },
                flags: ['hospitalized_day3'],
                nextEvent: 'day4_start_after_hospital',
            },
        ],
    },

    /**
     * DAY 3 - If not hospitalized
     *
     * Main event -> evening router (to check money crisis or midnight)
     */
    day3_main_event: {
        id: 'day3_main_event',
        day: 3,
        time: '10:00',
        title: 'Quy luật lượng - chất (Hoặc nhập viện)',
        description: 'Bạn bè rủ rê: đi nhậu, ở nhà học hay học nhóm?',
        narration: 'Nhóm chat rủ đi chơi. Bạn cần chọn.',
        bgImage: '/images/group_chat.jpg',
        bgMusic: 'bgm_ambience_cafe',
        condition: (state: GameState) => !state.flags.hospitalized_day3,
        choices: [
            {
                id: 'day3_party',
                text: 'Đi quẩy luôn! YOLO!',
                effects: { stress: -35, health: -20, knowledge: -5, money: -150000, consciousness: -25 },
                flags: ['party_animal'],
                nextEvent: 'day3_evening_router',
            },
            {
                id: 'day3_decline',
                text: 'Từ chối, kỷ luật sắt!',
                effects: { stress: 20, consciousness: 20, knowledge: 10 },
                flags: ['iron_discipline'],
                nextEvent: 'day3_evening_router',
            },
            {
                id: 'day3_group_study',
                text: 'Đi học nhóm với mấy bạn học giỏi',
                effects: { knowledge: 25, stress: 5, consciousness: 15, health: 5 },
                flags: ['group_study_boost'],
                nextEvent: 'day3_evening_router',
            },
        ],
    },

    /**
     * Router for Day 3 evening:
     * - If money < 100000 -> day3_money_crisis
     * - Else -> day3_midnight
     */
    day3_evening_router: {
        id: 'day3_evening_router',
        day: 3,
        time: '18:00',
        title: 'Router: Evening after Day 3',
        description: 'Routing evening events based on money situation.',
        narration: '',
        bgImage: '/images/empty_wallet.jpg',
        bgMusic: 'bgm_sad',
        choices: [
            {
                id: 'day3_evening_money_crisis',
                text: '[AUTO] Money crisis',
                condition: (state: GameState) => state.stats.money < 100000,
                effects: {},
                nextEvent: 'day3_money_crisis',
            },
            {
                id: 'day3_evening_to_midnight',
                text: '[AUTO] Proceed to midnight',
                condition: (state: GameState) => state.stats.money >= 100000,
                effects: {},
                nextEvent: 'day3_midnight',
            },
        ],
    },

    /**
     * DAY 3 - 19:00 money crisis (now reachable via router)
     */
    day3_money_crisis: {
        id: 'day3_money_crisis',
        day: 3,
        time: '19:00',
        title: 'Hết tiền ăn',
        description: 'Bạn mở ví: gần hết tiền. Phải xử lý.',
        narration: 'Bụng đói cồn cào. Ví vỏn vẹn.',
        bgImage: '/images/empty_wallet.jpg',
        bgMusic: 'bgm_sad',
        condition: (state: GameState) => state.stats.money < 100000,
        choices: [
            {
                id: 'day3_food_no_money',
                text: 'Ăn mì tôm 3 bữa',
                effects: { health: -15, stress: 10, money: -15000 },
                flags: ['poverty_mode'],
                nextEvent: 'day3_midnight',
            },
            {
                id: 'day3_borrow',
                text: 'Vay tiền bạn (Mặt dày)',
                effects: { health: 10, consciousness: -10, money: 100000 },
                flags: ['debt'],
                nextEvent: 'day3_midnight',
            },
            {
                id: 'day3_call_parents',
                text: 'Gọi bố mẹ xin thêm tiền',
                effects: { health: 10, money: 200000, stress: 15 },
                nextEvent: 'day3_midnight',
            },
        ],
    },

    /**
     * DAY 3 - Midnight standard loop
     *
     * Sleep now sets sleepless_count: 0; staying awake sets sleepless_count: 1.
     */
    day3_midnight: {
        id: 'day3_midnight',
        day: 3,
        time: '00:00',
        title: 'Đêm thứ 3 - Quyết định',
        description: 'Vòng lặp đêm: ngủ/đi chơi/học xuyên đêm. Cẩn trọng vì có thể dẫn tới nhập viện ngày sau.',
        narration: 'Đêm thứ 3. Quyết định của bạn ảnh hưởng trực tiếp đến ngày 4.',
        bgImage: '/images/night_choices.jpg',
        bgMusic: 'bgm_tension',
        choices: [
            {
                id: 'day3_mid_sleep',
                text: 'Đi ngủ',
                effects: { health: 25, stress: -10, sleepless_count: 0 },
                nextEvent: 'resolve_next_day',
            },
            {
                id: 'day3_mid_play',
                text: 'Cày phim/Chơi game',
                effects: { stress: -25, health: -25, sleepless_count: 1 },
                nextEvent: 'resolve_next_day',
            },
            {
                id: 'day3_mid_study',
                text: 'Học xuyên đêm',
                effects: { knowledge: 20, health: -30, stress: 20, sleepless_count: 1 },
                nextEvent: 'resolve_next_day',
            },
        ],
    },

    /**
     * DAY 4 - Main event 09:00 Kh���ng hoảng tư duy
     */
    day4_main_event: {
        id: 'day4_main_event',
        day: 4,
        time: '09:00',
        title: 'Phủ định của phủ định - Khủng hoảng tư duy',
        description: 'Bạn phát hiện nhiều hiểu nhầm trong kiến thức, cần quyết định đọc lại hay học tủ.',
        narration: 'Bạn đọc lại nội dung và nhận ra mình hiểu sai.',
        bgImage: '/images/library_day.jpg',
        bgMusic: 'bgm_reflection',
        choices: [
            {
                id: 'day4_deep_read',
                text: 'Đọc lại từ khái niệm gốc trong sách Mác',
                effects: { knowledge: 15, consciousness: 20, stress: 10, time: 4 },
                flags: ['deep_understanding'],
                nextEvent: 'day4_blackout',
            },
            {
                id: 'day4_surface',
                text: 'Học vẹt keywords để thi (Học tủ)',
                effects: { knowledge: 10, stress: -5, time: 2 },
                flags: ['surface_learning_2'],
                nextEvent: 'day4_blackout',
            },
            {
                id: 'day4_email_teacher',
                text: 'Hỏi thầy/cô qua email',
                effects: { knowledge: 20, consciousness: 15, stress: -5 },
                flags: ['teacher_guidance'],
                nextEvent: 'day4_blackout',
            },
        ],
    },

    /**
     * DAY 4 - 15:00 random event: mất điện toàn khu
     */
    day4_blackout: {
        id: 'day4_blackout',
        day: 4,
        time: '15:00',
        title: 'Mất điện toàn khu',
        description: 'Khu ký túc xá mất điện do sự cố, phải xử lý.',
        narration: 'Khu ký túc xá mất điện. Máy sắp hết pin. Bạn cần chọn.',
        bgImage: '/images/blackout.jpg',
        bgMusic: 'bgm_silence',
        condition: (state: GameState) => true,
        choices: [
            {
                id: 'day4_blackout_cafe',
                text: 'Ra quán cafe có điện',
                effects: { money: -50000, knowledge: 8, health: -5 },
                nextEvent: 'day4_midnight',
            },
            {
                id: 'day4_blackout_paper',
                text: 'Đọc sách giấy, tận dụng ánh sáng tự nhiên',
                effects: { knowledge: 5, consciousness: 10 },
                nextEvent: 'day4_midnight',
            },
            {
                id: 'day4_blackout_rest',
                text: 'Nằm nghỉ, chấp nhận mất thời gian',
                effects: { health: 10, stress: -15, knowledge: -3 },
                nextEvent: 'day4_midnight',
            },
        ],
    },

    /**
     * DAY 4 - Midnight
     *
     * Sleep resets sleepless_count to 0; staying awake sets to 1.
     */
    day4_midnight: {
        id: 'day4_midnight',
        day: 4,
        time: '00:00',
        title: 'Đêm thứ 4 - Vòng lặp',
        description: 'Tiếp tục vòng lặp đêm — lưu ý nếu Day3 và Day4 đều thức -> Day5 nhập viện.',
        narration: 'Đêm thứ 4. Hãy cân nhắc sức khoẻ!',
        bgImage: '/images/night_choices.jpg',
        bgMusic: 'bgm_tension',
        choices: [
            {
                id: 'day4_mid_sleep',
                text: 'Đi ngủ',
                effects: { health: 25, stress: -10, sleepless_count: 0 },
                nextEvent: 'resolve_next_day',
            },
            {
                id: 'day4_mid_play',
                text: 'Cày phim/Chơi game',
                effects: { stress: -25, health: -25, sleepless_count: 1 },
                nextEvent: 'resolve_next_day',
            },
            {
                id: 'day4_mid_study',
                text: 'Học xuyên đêm',
                effects: { knowledge: 20, health: -30, stress: 20, sleepless_count: 1 },
                nextEvent: 'resolve_next_day',
            },
        ],
    },

    /**
     * DAY 5 - Morning hospital check (may be targeted by resolver)
     */
    day5_hospital_check: {
        id: 'day5_hospital_check',
        day: 5,
        time: '08:00',
        title: 'Hospital Check Day 5',
        description: 'Kiểm tra nếu tiếp tục thiếu ngủ dẫn đến nhập viện (skip day).',
        narration:
            'Sức khoẻ cảnh báo: nếu vẫn thiếu ngủ hoặc sức khoẻ quá thấp, bạn có thể phải vào viện.',
        bgImage: '/images/hospital_room.jpg',
        bgMusic: 'bgm_hospital',
        condition: (state: GameState) => state.stats.sleepless_count >= 2 || state.stats.health <= 0,
        choices: [
            {
                id: 'day5_hospital_accept',
                text: 'Nhập viện & nghỉ ngày',
                effects: { health: -50, knowledge: -10, stress: 25, money: -100000, sleepless_count: 0 },
                flags: ['hospitalized_day5'],
                nextEvent: 'day6_start_after_hospital',
            },
        ],
    },

    /**
     * DAY 5 - Mock test event 08:00 (main)
     */
    day5_mock_test: {
        id: 'day5_mock_test',
        day: 5,
        time: '08:00',
        title: 'Mock Test - Đề thi thử MLN111',
        description: 'Giáo viên đăng đề thi thử trên LMS. Làm ngay!',
        narration: 'Bắt đầu làm đề thi thử. Điểm phụ thuộc vào Knowledge.',
        bgImage: '/images/mock_test.jpg',
        bgMusic: 'bgm_exam',
        choices: [
            {
                id: 'day5_mock_submit',
                text: 'Nộp bài (Hệ thống sẽ đánh giá và đưa ra nhánh)',
                effects: {},
                nextEvent: 'day5_mock_result',
            },
        ],
    },

    /**
     * day5_mock_result - chooses followup based on Knowledge
     */
    day5_mock_result: {
        id: 'day5_mock_result',
        day: 5,
        time: '08:30',
        title: 'Mock result - đánh giá nhanh',
        description: 'Hệ thống đánh giá kết quả thử nghiệm để đưa ra nhánh tiếp theo.',
        narration: '',
        bgImage: '/images/mock_result.jpg',
        bgMusic: 'bgm_result',
        choices: [
            {
                id: 'day5_mock_good',
                text: '[AUTO] Kết quả tốt',
                condition: (state: GameState) => state.stats.knowledge >= 70,
                effects: {},
                nextEvent: 'day5_senior_share',
            },
            {
                id: 'day5_mock_ok',
                text: '[AUTO] Kết quả trung bình',
                condition: (state: GameState) => state.stats.knowledge >= 45 && state.stats.knowledge < 70,
                effects: {},
                nextEvent: 'day5_midnight',
            },
            {
                id: 'day5_mock_poor',
                text: '[AUTO] Kết quả kém',
                condition: (state: GameState) => state.stats.knowledge < 45,
                effects: {},
                nextEvent: 'day5_midnight',
            },
        ],
    },

    /**
     * DAY 5 - Senior share / midnight
     */
    day5_senior_share: {
        id: 'day5_senior_share',
        day: 5,
        time: '20:00',
        title: 'Anh khóa trên chia sẻ tài liệu',
        description: 'Senior gửi file tổng hợp đề thi. Bạn quyết định tin tưởng hay không.',
        narration: 'Inbox: De_thi_MLN_2024_Summary.pdf',
        bgImage: '/images/senior_share.jpg',
        bgMusic: 'bgm_inbox',
        choices: [
            {
                id: 'day5_trust_guide',
                text: 'Tin tưởng tuyệt đối! Học theo tủ này!',
                effects: { knowledge: 25 },
                flags: ['trust_study_guide'],
                nextEvent: 'day5_midnight',
            },
            {
                id: 'day5_use_as_ref',
                text: 'Dùng tham khảo, vẫn học sách chính',
                effects: { knowledge: 15, consciousness: 10 },
                nextEvent: 'day5_midnight',
            },
            {
                id: 'day5_not_trust',
                text: 'Không tin, tự học mới chuẩn',
                effects: { knowledge: 10, consciousness: 15 },
                nextEvent: 'day5_midnight',
            },
        ],
    },

    /**
     * DAY 5 - Midnight
     */
    day5_midnight: {
        id: 'day5_midnight',
        day: 5,
        time: '00:00',
        title: 'Đêm thứ 5 - Quan trọng',
        description: 'Chỉ còn 2 ngày đến thi. Cẩn trọng nếu thức tiếp.',
        narration:
            'CHỈ CÒN 2 NGÀY NỮA LÀ THI! Nếu thức đêm nay + thức đêm mai → Đi thi kiệt sức!',
        bgImage: '/images/night_choices.jpg',
        bgMusic: 'bgm_tension',
        choices: [
            {
                id: 'day5_mid_sleep',
                text: 'Đi ngủ',
                effects: { health: 25, stress: -10, sleepless_count: 0 },
                nextEvent: 'resolve_next_day',
            },
            {
                id: 'day5_mid_play',
                text: 'Chơi/Phá game xuyên đêm',
                effects: { stress: -25, health: -25, sleepless_count: 1 },
                nextEvent: 'resolve_next_day',
            },
            {
                id: 'day5_mid_study',
                text: 'Học xuyên đêm',
                effects: { knowledge: 20, health: -30, stress: 20, sleepless_count: 1 },
                nextEvent: 'resolve_next_day',
            },
        ],
    },

    /**
     * DAY 6 - Main
     */
    day6_main_event: {
        id: 'day6_main_event',
        day: 6,
        time: '09:00',
        title: '24 giờ cuối cùng',
        description: 'Ngày cuối trước thi: chọn chiến lược ôn cuối cùng.',
        narration: '24 giờ cuối cùng. Đây là cơ hội cuối để chuẩn bị.',
        bgImage: '/images/day6_countdown.jpg',
        bgMusic: 'bgm_countdown',
        choices: [
            {
                id: 'day6_relax',
                text: 'Ôn nhẹ nhàng + Nghe nhạc thiền + Chuẩn bị tinh thần',
                effects: { stress: -35, health: 15, consciousness: 20, knowledge: 5 },
                nextEvent: 'day6_phone_call',
            },
            {
                id: 'day6_cramming',
                text: 'Cramming (Nhồi nhét kiến thức cường độ cao)',
                effects: { knowledge: 25, stress: 35, health: -25, consciousness: 10 },
                flags: ['cramming_final'],
                nextEvent: 'day6_phone_call',
            },
            {
                id: 'day6_cheat_prepare',
                text: 'Chuẩn bị phao thi (Nếu có flag has_cheat_sheet)',
                effects: { stress: -10, consciousness: -25 },
                condition: (state: GameState) => !!state.flags.has_cheat_sheet,
                nextEvent: 'day6_phone_call',
            },
        ],
    },

    /**
     * DAY 6 - Phone call
     */
    day6_phone_call: {
        id: 'day6_phone_call',
        day: 6,
        time: '20:00',
        title: 'Điện thoại bố mẹ',
        description: 'Mẹ gọi trước ngày thi; bắt bạn trấn an hoặc chia sẻ lo lắng.',
        narration: 'Incoming call: Mẹ 💕',
        bgImage: '/images/phone_call.jpg',
        bgMusic: 'bgm_home',
        choices: [
            {
                id: 'day6_reassure_parents',
                text: "Trấn an bố mẹ: 'Con ổn mà!'",
                effects: { stress: 10, consciousness: 5 },
                nextEvent: 'day6_final_hour',
            },
            {
                id: 'day6_honest_parents',
                text: "Thật lòng: 'Con hơi lo...'",
                effects: { stress: -15, health: 5 },
                nextEvent: 'day6_final_hour',
            },
        ],
    },

    /**
     * DAY 6 - Final night
     */
    day6_final_hour: {
        id: 'day6_final_hour',
        day: 6,
        time: '23:00',
        title: 'Đêm định mệnh (1 giờ trước thi)',
        description: 'Quyết định cuối cùng trước khi vào phòng thi sáng mai.',
        narration: 'Mai 8h: Thi. Bạn làm gì trong giờ cuối này?',
        bgImage: '/images/night_final.jpg',
        bgMusic: 'bgm_last_minute',
        choices: [
            {
                id: 'day6_final_sleep',
                text: 'Ngủ sớm (22:00)',
                effects: { health: 30, stress: -20, sleepless_count: 0 },
                nextEvent: 'day7_wakeup',
            },
            {
                id: 'day6_final_play',
                text: 'Chơi game/xem phim (Tự sát)',
                effects: { stress: -20, health: -30, sleepless_count: 1, consciousness: -25 },
                flags: ['night_before_disaster'],
                nextEvent: 'day7_wakeup',
            },
            {
                id: 'day6_final_allin',
                text: 'Học tới sáng (All-in cuối cùng)',
                effects: { knowledge: 35, health: -40, stress: 25, sleepless_count: 1 },
                flags: ['all_in_final_night'],
                nextEvent: 'day7_wakeup',
            },
        ],
    },

    /**
     * DAY 7 - Wakeup & exam
     */
    day7_wakeup: {
        id: 'day7_wakeup',
        day: 7,
        time: '07:30',
        title: 'Thức dậy trước ngày thi',
        description: 'Bạn tỉnh dậy. Nếu sleepless_count == 1, bạn có debuff sleep-deprived.',
        narration: 'Bạn giật mình tỉnh dậy. Mắt đỏ hoe nếu thiếu ngủ.',
        bgImage: '/images/wakeup_exam.jpg',
        bgMusic: 'bgm_alarm',
        choices: [
            {
                id: 'day7_wakeup_prep',
                text: 'Chuẩn bị và đi thi',
                effects: {},
                nextEvent: 'day7_exam_start',
            },
        ],
    },

    day7_exam_start: {
        id: 'day7_exam_start',
        day: 7,
        time: '08:05',
        title: 'Phòng thi 101-A3 - Phát đề',
        description: 'Vào phòng thi, đề được phát. Tùy trạng thái bạn có các lựa chọn đặc biệt.',
        narration:
            'Giám thị phát đề. Bắt đầu làm. Nếu health <= 0 -> bad end "Xe Cấp Cứu 115". Nếu Knowledge cao -> best ending.',
        bgImage: '/images/exam_hall.jpg',
        bgMusic: 'bgm_exam_tension',
        choices: [
            {
                id: 'day7_exam_cheat',
                text: 'Sử dụng phao thi (nếu có)',
                effects: {},
                condition: (state: GameState) => !!state.flags.has_cheat_sheet,
            },
            {
                id: 'day7_exam_guess',
                text: 'Khoanh bừa (cầu may)',
                effects: {},
            },
            {
                id: 'day7_exam_honest',
                text: 'Làm bài hết sức theo hiểu biết',
                effects: {},
            },
        ],
    },

    day7_post_exam: {
        id: 'day7_post_exam',
        day: 7,
        time: '10:00',
        title: 'Kết thúc kỳ thi - Chấm điểm',
        description: 'Hệ thống chấm điểm dựa trên Knowledge, Health và Flags.',
        narration:
            'Kết quả thi được tính: điểm = (Knowledge / 10) + random(-1, +1), sau đó áp điều kiện để xác định ending.',
        bgImage: '/images/post_exam.jpg',
        bgMusic: 'bgm_result',
        choices: [
            {
                id: 'postexam_continue',
                text: 'Chờ email công bố điểm',
                effects: {},
            },
        ],
    },

    /**
     * OPTIONAL: followups
     */
    day3_potential_date: {
        id: 'day3_potential_date',
        day: 3,
        time: '18:00',
        title: 'Crush hẹn đi chơi',
        description: 'Do bạn nhắn tin tán tỉnh ngày trước: crush có thể hẹn đi chơi.',
        narration: 'Crush rep và gợi ý đi cà phê tối nay.',
        bgImage: '/images/crush_meet.jpg',
        bgMusic: 'bgm_romantic',
        condition: (state: GameState) => !!state.flags.crush_distracted,
        choices: [
            {
                id: 'crush_yes',
                text: 'Đồng ý hẹn đi chơi (distracted)',
                effects: { stress: -20, knowledge: -10, consciousness: -20, time: 2, money: -30000 },
                flags: ['crush_date'],
                nextEvent: 'day4_start',
            },
            {
                id: 'crush_no',
                text: 'Từ chối, tập trung ôn',
                effects: { stress: 10, consciousness: 10, knowledge: 5 },
                nextEvent: 'day4_start',
            },
        ],
    },

    /**
     * Utility starts for days after hospital skip
     */
    day4_start_after_hospital: {
        id: 'day4_start_after_hospital',
        day: 4,
        time: '08:00',
        title: 'Day 4 - Sau khi điều trị',
        description: 'Bạn đã được nghỉ dưỡng tại y tế. Ngày 4 bắt đầu với một số hậu quả.',
        narration: 'Bạn tỉnh lại sau truyền nước. Cơ thể phục hồi phần nào, nhưng thời gian ôn bị mất.',
        bgImage: '/images/hospital_exit.jpg',
        bgMusic: 'bgm_relief',
        choices: [
            {
                id: 'day4_after_hospital_continue',
                text: 'Tiếp tục hành trình (bắt đầu ngày)',
                effects: {},
                nextEvent: 'day4_main_event',
            },
        ],
    },

    day6_start_after_hospital: {
        id: 'day6_start_after_hospital',
        day: 6,
        time: '08:00',
        title: 'Day 6 - Sau khi điều trị',
        description: 'Bạn bỏ lỡ ngày ôn luyện do nhập viện. Hậu quả nặng.',
        narration: 'Bạn thiết lập lại lịch và cố gắng bù đắp.',
        bgImage: '/images/hospital_exit.jpg',
        bgMusic: 'bgm_relief',
        choices: [
            {
                id: 'day6_after_hospital_continue',
                text: 'Bắt đầu ngày 6 (nhanh chóng ôn lại)',
                effects: {},
                nextEvent: 'day6_main_event',
            },
        ],
    },

    /**
     * Generic day starts
     */
    day4_start: {
        id: 'day4_start',
        day: 4,
        time: '08:00',
        title: 'Day 4 - Bắt đầu',
        description: 'Bắt đầu ngày 4.',
        narration: 'Ngày 4 bắt đầu. Hãy tiếp tục hành trình ôn tập.',
        bgImage: '/images/day4_morning.jpg',
        bgMusic: 'bgm_morning_birds',
        choices: [
            {
                id: 'day4_continue',
                text: 'Tiếp tục',
                effects: {},
                nextEvent: 'day4_main_event',
            },
        ],
    },

    day5_start: {
        id: 'day5_start',
        day: 5,
        time: '08:00',
        title: 'Day 5 - Bắt đầu',
        description: 'Bắt đầu ngày 5.',
        narration: 'Ngày 5: Mock test sắp đến.',
        bgImage: '/images/day5_morning.jpg',
        bgMusic: 'bgm_morning_birds',
        choices: [
            {
                id: 'day5_continue',
                text: 'Tiếp tục',
                effects: {},
                nextEvent: 'day5_mock_test',
            },
        ],
    },

    day6_start: {
        id: 'day6_start',
        day: 6,
        time: '08:00',
        title: 'Day 6 - Bắt đầu (24h)',
        description: 'Ngày 6 bắt đầu: chuẩn bị cho 24 giờ cuối cùng.',
        narration: 'Hôm nay là ngày quyết định.',
        bgImage: '/images/day6_morning.jpg',
        bgMusic: 'bgm_morning_birds',
        choices: [
            {
                id: 'day6_continue',
                text: 'Tiếp tục',
                effects: {},
                nextEvent: 'day6_main_event',
            },
        ],
    },

    day7_start: {
        id: 'day7_start',
        day: 7,
        time: '07:30',
        title: 'Day 7 - Judgment Day',
        description: 'Ngày phán xét cuối cùng: thi chính thức.',
        narration: 'Sáng nay bạn đi thi.',
        bgImage: '/images/day7_morning.jpg',
        bgMusic: 'bgm_alarm',
        choices: [
            {
                id: 'day7_enter_exam',
                text: 'Vào phòng thi',
                effects: {},
                nextEvent: 'day7_exam_start',
            },
        ],
    },
}

export default EVENTS