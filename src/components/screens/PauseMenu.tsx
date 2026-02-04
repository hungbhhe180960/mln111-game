import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../stores/gameStore'
import { useSettingsStore } from '../../stores/settingsStores'

type Props = {
    open: boolean
    onClose: () => void
    onOpenSettings: () => void
    onQuitToMenu: () => void
}

/**
 * PauseMenu:
 * - overlay shown when open===true
 * - listens for ESC to close
 * - actions: Resume / Settings / Main Menu (with confirm)
 */
export default function PauseMenu({ open, onClose, onOpenSettings, onQuitToMenu }: Props) {
    const resetGame = useGameStore(s => s.resetGame)
    const saveGame = useGameStore(s => s.saveGame)
    const { setAutoSave } = useSettingsStore()

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        if (open) {
            window.addEventListener('keydown', onKey)
        } else {
            window.removeEventListener('keydown', onKey)
        }
        return () => window.removeEventListener('keydown', onKey)
    }, [open, onClose])

    if (!open) return null

    function handleQuit() {
        const ok = confirm('Quay về Menu chính sẽ mất tiến độ chưa lưu. Bạn có chắc?')
        if (!ok) return
        // optionally disable autosave to prevent overwriting save
        setAutoSave(false)
        // perform reset or navigate
        resetGame()
        try {
            saveGame()
        } catch {}
        onQuitToMenu()
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-60 flex items-center justify-center bg-black/50">
            <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }} className="bg-white/6 backdrop-blur-md border border-white/10 rounded-lg p-6 w-[92%] max-w-sm">
                <h3 className="text-lg font-semibold text-white mb-3">Tạm dừng</h3>
                <div className="flex flex-col gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-primary text-black font-medium">Resume</button>
                    <button onClick={() => onOpenSettings()} className="px-4 py-2 rounded bg-white/6 text-white">Settings</button>
                    <button onClick={handleQuit} className="px-4 py-2 rounded bg-red-600 text-white">Main Menu</button>
                </div>
                <div className="mt-4 text-xs text-neutral-300">
                    Nhấn ESC để tiếp tục
                </div>
            </motion.div>
        </motion.div>
    )
}