import { useEffect, useRef, useState } from 'react'

type Props = {
    text: string
    speed?: number // ms per character
    onComplete?: () => void
    className?: string
}

/**
 * TypingText:
 * - Hiệu ứng gõ chữ từng ký tự.
 * - Tự động dừng lâu hơn ở dấu câu.
 * - Click vào để hiện toàn bộ văn bản ngay lập tức.
 * - [FIX] Dùng useRef cho onComplete để tránh lỗi dependency change.
 */
export default function TypingText({ text, speed = 30, onComplete, className = '' }: Props) {
    const [displayed, setDisplayed] = useState('')
    const idxRef = useRef(0)
    const mounted = useRef(true)
    const skipRef = useRef(false)
    const timerRef = useRef<number | null>(null)

    // Lưu onComplete vào ref để luôn có bản mới nhất mà không gây re-effect
    const onCompleteRef = useRef(onComplete)
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    useEffect(() => {
        mounted.current = true
        idxRef.current = 0
        setDisplayed('')
        skipRef.current = false

        function isPunctuation(ch: string) {
            return ch === '.' || ch === ',' || ch === '!' || ch === '?'
        }

        function step() {
            if (!mounted.current) return

            // Nếu đã skip, gọi onComplete và dừng
            if (skipRef.current) {
                setDisplayed(text)
                onCompleteRef.current?.()
                return
            }

            // Nếu đã gõ hết
            if (idxRef.current >= text.length) {
                onCompleteRef.current?.()
                return
            }

            const ch = text[idxRef.current]
            setDisplayed(prev => prev + ch)
            idxRef.current += 1

            let delay = speed
            // Pause lâu hơn ở dấu câu
            if (isPunctuation(ch)) delay = Math.max(120, speed * 6)
            // Pause cực lâu ở dấu chấm lửng (...)
            if (ch === '.' && text[idxRef.current] === '.' && text[idxRef.current + 1] === '.') {
                delay = Math.max(220, speed * 8)
            }

            timerRef.current = window.setTimeout(step, delay)
        }

        // Start typing
        timerRef.current = window.setTimeout(step, speed)

        return () => {
            mounted.current = false
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }
    }, [text, speed]) // Dependency array cố định kích thước -> Fix lỗi React

    function handleClick() {
        // Skip effect
        if (displayed !== text) {
            skipRef.current = true
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
            setDisplayed(text)
            onCompleteRef.current?.()
        }
    }

    return (
        <span onClick={handleClick} className={`select-text ${className} cursor-pointer`}>
            {displayed}
            {/* Con trỏ nhấp nháy khi đang gõ */}
            {displayed !== text && <span className="animate-pulse ml-0.5 inline-block w-1.5 h-4 bg-current align-middle"></span>}
        </span>
    )
}