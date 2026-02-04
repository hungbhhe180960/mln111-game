/**
 * Types for "Mùa ôn thi" Visual Novel
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

    // Additional flags
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
    knowledge_gap?: boolean
    caffeine_addict?: boolean
    burnout_risk?: boolean
    integrity?: boolean
    cramming_final?: boolean
    stomach_ache?: boolean
    all_in_final_night?: boolean

    // Exam & Ending specific
    cheat_success?: boolean
    cheat_caught?: boolean
    miracle_survivor?: boolean
    lucky_guess?: boolean

    // Dynamic flags allowed
    [key: string]: boolean | undefined
}

export type GameState = {
    day: number
    time: string // "HH:mm"
    stats: Stats
    flags: Flags
    currentEventId: string | null
    endingId: string | null
    history: any[]
}

/**
 * Choice: Một lựa chọn trong sự kiện
 */
export interface Choice {
    id: string
    text: string
    /**
     * effects: Thay đổi chỉ số nhân vật.
     * Thêm `time`: số giờ sẽ trôi qua khi chọn (ví dụ: time: 2 => trôi 2 tiếng).
     */
    effects?: Partial<Stats> & { time?: number }
    flags?: string[]
    nextEvent?: string
    condition?: (state: GameState) => boolean
}

export interface Event {
    id: string
    day: number
    time: string
    title: string
    description?: string
    narration?: string
    choices: Choice[]
    condition?: (state: GameState) => boolean
    bgImage?: string
    bgMusic?: string
}

export type GameEvent = Event

export interface Ending {
    id: string
    title: string
    description?: string
    achievements?: string[]
    condition: (state: GameState) => boolean
}

export interface Story {
    title: string
    author: string
    events: Event[]
}