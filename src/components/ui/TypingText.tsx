import { useEffect, useRef, useState } from 'react'

type Props = {
    text: string
    speed?: number // ms per character
    onComplete?: () => void
    className?: string
}

/**
 * TypingText:
 * - types text character by character
 * - pauses slightly longer on punctuation (. , ! ?)
 * - clicking will skip and show full text immediately
 */
export default function TypingText({ text, speed = 30, onComplete, className = '' }: Props) {
    const [displayed, setDisplayed] = useState('')
    const idxRef = useRef(0)
    const mounted = useRef(true)
    const skipRef = useRef(false)
    const timerRef = useRef<number | null>(null)

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
            if (skipRef.current) {
                // show all
                setDisplayed(text)
                onComplete?.()
                return
            }
            if (idxRef.current >= text.length) {
                onComplete?.()
                return
            }
            const ch = text[idxRef.current]
            setDisplayed(prev => prev + ch)
            idxRef.current += 1

            // determine delay
            let delay = speed
            if (isPunctuation(ch)) delay = Math.max(120, speed * 6) // longer pause
            // small extra pause after ellipsis
            if (ch === '.' && text[idxRef.current] === '.' && text[idxRef.current + 1] === '.') {
                delay = Math.max(220, speed * 8)
            }

            timerRef.current = window.setTimeout(step, delay)
        }

        // start
        timerRef.current = window.setTimeout(step, speed)

        return () => {
            mounted.current = false
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [text, speed])

    function handleClick() {
        // skip typing
        if (displayed !== text) {
            skipRef.current = true
            // clear timer and show full
            if (timerRef.current) {
                clearTimeout(timerRef.current)
                timerRef.current = null
            }
            setDisplayed(text)
            onComplete?.()
        }
    }

    return (
        <p onClick={handleClick} className={`select-text text-base leading-relaxed ${className}`}>
            {displayed}
            {/* caret when typing */}
            {displayed !== text ? <span className="inline-block w-1 h-5 align-middle bg-neutral-700 ml-1 animate-pulse" /> : null}
        </p>
    )
}