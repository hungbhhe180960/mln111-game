
export default function ProgressBar({ value = 0 }: { value?: number }) {
    return (
        <div className="w-full bg-neutral-100 h-3 rounded-md overflow-hidden">
            <div className="h-3 bg-primary" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
    )
}