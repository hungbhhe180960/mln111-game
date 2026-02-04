import { useEffect, useState } from 'react'

export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function getDeviceType(width: number): DeviceType {
    if (width < 768) return 'mobile'
    if (width < 1024) return 'tablet'
    return 'desktop'
}

/**
 * Hook to track device type by window width.
 * Debounced simple implementation (on resize).
 */
export default function useDevice() {
    const [device, setDevice] = useState<DeviceType>(() =>
        typeof window !== 'undefined' ? getDeviceType(window.innerWidth) : 'desktop'
    )

    useEffect(() => {
        let raf = 0
        function onResize() {
            if (raf) cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                setDevice(getDeviceType(window.innerWidth))
            })
        }
        window.addEventListener('resize', onResize)
        return () => {
            window.removeEventListener('resize', onResize)
            if (raf) cancelAnimationFrame(raf)
        }
    }, [])

    return { device, isMobile: device === 'mobile', isTablet: device === 'tablet', isDesktop: device === 'desktop' }
}