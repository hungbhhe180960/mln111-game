/**
 * Types for "Mùa ôn thi" Visual Novel
 *
 * Ghi chú:
 * - Các hàm `condition` không thể serialize vào JSON trực tiếp. Khi load từ JSON
 *   bạn có thể ánh xạ `conditionId` thành hàm thực thi trong runtime (registry).
 */

export type Stats = {
    knowledge: number        // 0..100
    health: number          // 0..100
    stress: number          // 0..100
    consciousness: number   // 0..100
    sleepless_count: number // integer >= 0
    money: number           // VND
}

export interface Flags {
    lazy_start?: boolean
    focused_start?: boolean
    hardcore_start?: boolean
    has_cheat_sheet?: boolean
    brain_fog?: boolean
    headache?: boolean
    learned_from_senior?: boolean
    crush_distracted?: boolean
    hospitalized_day3?: boolean
    hospitalized_day5?: boolean
    hospitalized_day6?: boolean

    // Additional gameplay flags described in the script
    lazy_pattern_start?: boolean
    night_owl_pattern?: boolean
    grinder_pattern?: boolean
    procrastination_day2?: boolean
    surface_learning?: boolean
    discipline_mode?: boolean
    party_animal?: boolean
    iron_discipline?: boolean
    group_study_boost?: boolean
    deep_understanding?: boolean
    surface_learning_2?: boolean
    teacher_guidance?: boolean
    poverty_mode?: boolean
    debt?: boolean
    redemption_arc?: boolean
    trust_study_guide?: boolean
    cramming_final?: boolean
    all_in_final_night?: boolean
    night_before_disaster?: boolean
    // Allow extensibility for any other named flags
    [key: string]: boolean | undefined
}

/**
 * GameState: trạng thái hiện thời của trò chơi
 */
export interface GameState {
    day: number                 // 1..7
    time: string                // e.g. "08:00", "16:00", "00:00"
    stats: Stats
    flags: Flags
    currentEvent: string | null // event id đang diễn ra
    history: Choice[]           // danh sách choices đã chọn (lưu nguyên Choice để trace)
}

/**
 * Choice: một lựa chọn xuất hiện trong Event
 * - effects: thay đổi stats (Partial để chỉ định những trường bị ảnh hưởng)
 * - flags: list các flag sẽ bật khi chọn option này
 * - condition: optional runtime predicate để kiểm tra có hiển thị/cho phép chọn hay không
 */
export interface Choice {
    id: string
    text: string
    effects?: Partial<Stats>
    flags?: string[]
    nextEvent?: string
    /**
     * Optional condition function executed at runtime to determine availability.
     * Lưu ý: không thể lưu trực tiếp vào JSON; dùng một `conditionId` trong dữ liệu
     * rồi ánh xạ sang hàm khi khởi tạo.
     */
    condition?: (state: GameState) => boolean
}

/**
 * Event: một sự kiện / đoạn kịch bản xuất hiện vào ngày/giờ cụ thể
 */
export interface Event {
    id: string
    day: number
    time: string
    title: string
    description?: string
    narration?: string
    choices: Choice[]
    /**
     * Optional runtime condition to determine if event is active.
     * (Ví dụ: chỉ xuất hiện khi flag X = true)
     */
    condition?: (state: GameState) => boolean
    bgImage?: string   // đường dẫn hoặc key tới ảnh nền (ví dụ: "day1_dorm.jpg")
    bgMusic?: string   // đường dẫn hoặc key tới file nhạc (ví dụ: "bgm_tension.mp3")
}
export type GameEvent = Event
/**
 * Ending: kết thúc có điều kiện
 */
export interface Ending {
    id: string
    title: string
    description?: string
    achievements?: string[]
    /**
     * condition: hàm kiểm tra xem trạng thái hiện tại có thỏa điều kiện end này không.
     * Lưu ý: ánh xạ tương tự như Event.condition khi load từ dữ liệu.
     */
    condition: (state: GameState) => boolean
}