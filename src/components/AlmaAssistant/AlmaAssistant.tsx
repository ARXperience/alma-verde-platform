'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { AlmaBubble } from './AlmaBubble'
import { AlmaCharacter } from './AlmaCharacter'
import { AlmaMenu } from './AlmaMenu'
import { assistantContent, routeDefaults } from './assistantContent'
import styles from './almaAssistant.module.css'

const HIDDEN_ROUTES = ['/admin', '/auth', '/dashboard', '/checkout', '/cotizar', '/tienda', '/products', '/projects', '/alma-verde', '/alma-home']
const MINIMIZED_KEY = 'alma-assistant-minimized'
const VARIANT_KEY = 'alma-assistant-variants'

function getInitialSection(pathname: string) {
    if (pathname.startsWith('/portafolio/')) return 'case-study'
    return routeDefaults[pathname] || 'hero'
}

export function AlmaAssistant() {
    const pathname = usePathname()
    const router = useRouter()
    const [currentSection, setCurrentSection] = useState(() => getInitialSection(pathname))
    const [activeMessage, setActiveMessage] = useState(() => assistantContent[getInitialSection(pathname)]?.message || assistantContent.hero.message)
    const [bubbleVisible, setBubbleVisible] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [minimized, setMinimized] = useState(false)
    const [mouthOpen, setMouthOpen] = useState(false)
    const [reducedMotion, setReducedMotion] = useState(false)
    const dismissedSection = useRef<string | null>(null)
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const hidden = HIDDEN_ROUTES.some((route) => pathname.startsWith(route))
    const content = assistantContent[currentSection] || assistantContent.hero

    const showMessage = useCallback((section: string) => {
        if (dismissedSection.current === section) return
        setBubbleVisible(true)
        if (hideTimer.current) clearTimeout(hideTimer.current)
        hideTimer.current = setTimeout(() => setBubbleVisible(false), 9000)
    }, [])

    useEffect(() => {
        const timer = window.setTimeout(() => {
            const options = [content.message, ...(content.variants || [])]
            let choices: Record<string, number> = {}
            try {
                choices = JSON.parse(window.sessionStorage.getItem(VARIANT_KEY) || '{}') as Record<string, number>
            } catch {
                window.sessionStorage.removeItem(VARIANT_KEY)
            }
            if (choices[currentSection] === undefined) {
                choices[currentSection] = currentSection
                    .split('')
                    .reduce((total, character) => total + character.charCodeAt(0), 0) % options.length
                window.sessionStorage.setItem(VARIANT_KEY, JSON.stringify(choices))
            }
            setActiveMessage(options[choices[currentSection] % options.length])
        }, 0)
        return () => window.clearTimeout(timer)
    }, [content, currentSection])

    useEffect(() => {
        const media = window.matchMedia('(prefers-reduced-motion: reduce)')
        const updateMotion = () => setReducedMotion(media.matches)
        const motionFrame = window.requestAnimationFrame(updateMotion)
        const storageTimer = window.setTimeout(() => {
            setMinimized(window.localStorage.getItem(MINIMIZED_KEY) === 'true')
        }, 0)
        media.addEventListener('change', updateMotion)
        return () => {
            window.cancelAnimationFrame(motionFrame)
            window.clearTimeout(storageTimer)
            media.removeEventListener('change', updateMotion)
        }
    }, [])

    useEffect(() => {
        if (hidden || minimized) return

        const initial = getInitialSection(pathname)
        dismissedSection.current = null

        const setupObserver = () => {
            const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-assistant-section]'))
            if (!sections.length) {
                showMessage(initial)
                return () => {}
            }

            const ratios = new Map<Element, number>()
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0))
                const active = sections.reduce<HTMLElement | null>((best, section) => {
                    if (!best) return section
                    return (ratios.get(section) || 0) > (ratios.get(best) || 0) ? section : best
                }, null)
                const sectionName = active?.dataset.assistantSection
                if (sectionName && assistantContent[sectionName] && (ratios.get(active) || 0) > 0) {
                    setCurrentSection((previous) => {
                        if (previous !== sectionName) {
                            dismissedSection.current = null
                            showMessage(sectionName)
                        }
                        return sectionName
                    })
                }
            }, { rootMargin: '-32% 0px -38% 0px', threshold: [0, 0.2, 0.45, 0.7] })

            sections.forEach((section) => observer.observe(section))
            showMessage(initial)
            return () => observer.disconnect()
        }

        let cleanup: () => void = () => {}
        const timer = window.setTimeout(() => {
            setCurrentSection(initial)
            cleanup = setupObserver()
        }, 120)

        return () => {
            window.clearTimeout(timer)
            cleanup()
            if (hideTimer.current) clearTimeout(hideTimer.current)
        }
    }, [hidden, minimized, pathname, showMessage])

    useEffect(() => {
        if (reducedMotion || (!bubbleVisible && !menuOpen)) {
            return
        }
        const interval = window.setInterval(() => setMouthOpen((open) => !open), 230)
        return () => window.clearInterval(interval)
    }, [bubbleVisible, menuOpen, reducedMotion])

    const minimize = () => {
        setMinimized(true)
        setBubbleVisible(false)
        setMenuOpen(false)
        window.localStorage.setItem(MINIMIZED_KEY, 'true')
    }

    const restore = () => {
        setMinimized(false)
        window.localStorage.removeItem(MINIMIZED_KEY)
        window.setTimeout(() => showMessage(currentSection), 50)
    }

    const handleNavigate = (href: string) => {
        setMenuOpen(false)
        const [targetPath, hash] = href.split('#')
        if (targetPath === pathname && hash) {
            document.getElementById(hash)?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
            return
        }
        router.push(href)
    }

    if (hidden) return null

    if (minimized) {
        return (
            <button type="button" className={styles.restoreButton} onClick={restore} aria-label="Mostrar a Alma">
                <Leaf aria-hidden="true" size={22} />
            </button>
        )
    }

    return (
        <div
            className={`${styles.assistant} ${styles[`position_${content.position}`]}`}
            style={{ '--alma-scale': content.scale || 1, '--alma-offset-y': `${content.offsetY || 0}px` } as React.CSSProperties}
            data-pose={content.pose}
        >
            <AlmaMenu open={menuOpen} onClose={() => setMenuOpen(false)} onNavigate={handleNavigate} />
            <AlmaBubble
                message={activeMessage}
                visible={bubbleVisible && !menuOpen}
                onClose={() => {
                    dismissedSection.current = currentSection
                    setBubbleVisible(false)
                }}
                onMinimize={minimize}
            />
            <AlmaCharacter
                pose={content.pose}
                mouthOpen={mouthOpen && !reducedMotion && (bubbleVisible || menuOpen)}
                onClick={() => {
                    setMenuOpen((open) => !open)
                    setBubbleVisible(false)
                }}
            />
        </div>
    )
}
