import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/settingsStores'
import useSound from '../../hooks/useSound'

type Props = {
    onClose?: () => void
}

/**
 * SettingsScreen
 * - Quản lý cài đặt người chơi
 * - Lưu settings vào localStorage qua store
 * - Có xác nhận trước khi reset
 */
export default function SettingsScreen({ onClose }: Props) {
    const {
        soundOn,
        volume,
        typingSpeed,
        autoSave,
        setSoundOn,
        setVolume,
        setTypingSpeed,
        setAutoSave,
        resetSettings,
        loadFromStorage,
    } = useSettingsStore()

    const [confirmReset, setConfirmReset] = useState(false)
    const { play, stop } = useSound()

    useEffect(() => {
        loadFromStorage()

        if (!soundOn) return

        try {
            play('/assets/sounds/open_menu.mp3', volume)
            const timer = setTimeout(() => stop(), 700)

            return () => clearTimeout(timer)
        } catch (err) {
            console.warn('Failed to play open menu sound:', err)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function handleConfirmReset() {
        const ok = window.confirm('Bạn có chắc muốn reset cài đặt về mặc định?')
        if (!ok) {
            setConfirmReset(false)
            return
        }

        resetAllToDefault()
        setConfirmReset(false)
        window.alert('Đã reset cài đặt.')
    }

    function resetAllToDefault() {
        resetSettings()

        try {
            localStorage.removeItem('mua-on-thi-save-v1')
        } catch (err) {
            console.warn('Failed to clear save data:', err)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="w-[92%] max-w-2xl rounded-2xl border border-white/10 bg-white/6 backdrop-blur-md p-6"
            >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Cài đặt</h3>
                    <button
                        onClick={onClose}
                        className="text-sm text-neutral-300 hover:text-white"
                    >
                        Đóng
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Sound */}
                    <SettingRow
                        title="Âm thanh"
                        desc="Bật / tắt toàn bộ âm thanh"
                    >
                        <Toggle checked={soundOn} onChange={setSoundOn} />
                    </SettingRow>

                    {/* Volume */}
                    <SettingRow
                        title="Âm lượng"
                        desc="Điều chỉnh âm lượng nền"
                    >
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={volume}
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="w-40"
                        />
                    </SettingRow>

                    {/* Typing speed */}
                    <SettingRow
                        title="Tốc độ Typing"
                        desc="Ảnh hưởng hiệu ứng gõ chữ"
                    >
                        <div className="flex gap-2">
                            {(['slow', 'normal', 'fast'] as const).map((speed) => (
                                <button
                                    key={speed}
                                    onClick={() => setTypingSpeed(speed)}
                                    className={`rounded px-3 py-1 ${
                                        typingSpeed === speed
                                            ? 'bg-white/10'
                                            : 'bg-white/5'
                                    }`}
                                >
                                    {speed === 'slow'
                                        ? 'Chậm'
                                        : speed === 'normal'
                                            ? 'Bình thường'
                                            : 'Nhanh'}
                                </button>
                            ))}
                        </div>
                    </SettingRow>

                    {/* Auto save */}
                    <SettingRow
                        title="Tự động lưu"
                        desc="Lưu tiến độ sau mỗi lựa chọn"
                    >
                        <Toggle checked={autoSave} onChange={setAutoSave} />
                    </SettingRow>

                    {/* Reset */}
                    <div className="border-t border-white/10 pt-4">
                        <SettingRow
                            title="Reset cài đặt"
                            desc="Khôi phục về mặc định"
                        >
                            <div className="flex gap-2">
                                {!confirmReset ? (
                                    <button
                                        onClick={() => setConfirmReset(true)}
                                        className="rounded bg-white/6 px-3 py-1 text-white"
                                    >
                                        Reset
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleConfirmReset}
                                            className="rounded bg-red-600 px-3 py-1 text-white"
                                        >
                                            Xác nhận
                                        </button>
                                        <button
                                            onClick={() => setConfirmReset(false)}
                                            className="rounded bg-white/6 px-3 py-1"
                                        >
                                            Hủy
                                        </button>
                                    </>
                                )}
                            </div>
                        </SettingRow>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

/* ================== */
/* Helper components */
/* ================== */

function SettingRow({
                        title,
                        desc,
                        children,
                    }: {
    title: string
    desc: string
    children: React.ReactNode
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <div className="text-sm font-medium text-neutral-200">
                    {title}
                </div>
                <div className="text-xs text-neutral-400">{desc}</div>
            </div>
            {children}
        </div>
    )
}

function Toggle({
                    checked,
                    onChange,
                }: {
    checked: boolean
    onChange: (v: boolean) => void
}) {
    return (
        <label className="relative inline-flex cursor-pointer items-center">
            <input
                type="checkbox"
                className="peer sr-only"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <div className="h-6 w-11 rounded-full bg-neutral-300 transition peer-checked:bg-primary" />
        </label>
    )
}
