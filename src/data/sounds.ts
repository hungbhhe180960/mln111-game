/**
 * SOUND MAP
 * Map logical sound keys to actual file paths (relative to `public/` or served static folder).
 *
 * Place files under `public/assets/sounds/` so they are available at runtime via `/assets/sounds/<file>.mp3`
 *
 * Example:
 * public/
 *  └─ assets/
 *     └─ sounds/
 *        ├ bgm_main_theme.mp3
 *        ├ bgm_lofi_study.mp3
 *        ...
 */
export const SOUND_MAP: Record<string, string> = {
    // Background music
    bgm_main_theme: '/assets/sounds/bgm_main_theme.mp3',
    bgm_ambient_school: '/assets/sounds/bgm_ambient_school.mp3',
    bgm_lofi_study: '/assets/sounds/bgm_lofi_study.mp3',
    bgm_tension_orchestral: '/assets/sounds/bgm_tension_orchestral.mp3',
    bgm_sleepy: '/assets/sounds/bgm_sleepy.mp3',
    bgm_morning_birds: '/assets/sounds/bgm_morning_birds.mp3',
    bgm_heartbeat: '/assets/sounds/bgm_heartbeat.mp3',
    bgm_hospital: '/assets/sounds/bgm_hospital.mp3',
    bgm_exam: '/assets/sounds/bgm_exam.mp3',
    bgm_countdown: '/assets/sounds/bgm_countdown.mp3',
    epic_victory: '/assets/sounds/epic_victory.mp3',
    happy_theme: '/assets/sounds/happy_theme.mp3',
    calm_neutral: '/assets/sounds/calm_neutral.mp3',
    sad_ominous: '/assets/sounds/sad_ominous.mp3',

    // SFX
    clock_tick: '/assets/sounds/clock_tick.mp3',
    thump: '/assets/sounds/thump.mp3',
    emergency_siren: '/assets/sounds/emergency_siren.mp3',
    hospital_ambience: '/assets/sounds/hospital_ambience.mp3',
    open_menu: '/assets/sounds/open_menu.mp3',
    click: '/assets/sounds/click.mp3',
    success: '/assets/sounds/success.mp3',
    error: '/assets/sounds/error.mp3',
    // add others as needed...
}

export default SOUND_MAP