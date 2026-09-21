'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import type { AlmaPose } from './assistantContent'
import styles from './almaAssistant.module.css'

interface AlmaCharacterProps {
    pose: AlmaPose
    mouthOpen: boolean
    onClick: () => void
}

type FaceExpression = 'calm' | 'happy' | 'curious' | 'focused' | 'surprised' | 'serene'

const expressionByPose: Record<AlmaPose, FaceExpression> = {
    idle: 'calm',
    wave: 'happy',
    point: 'focused',
    think: 'curious',
    build: 'focused',
    plant: 'serene',
    draw: 'focused',
    sit: 'calm',
    walk: 'curious',
    celebrate: 'happy',
}

const motion = {
    duration: 720,
    easing: 'cubic-bezier(.22, 1, .36, 1)',
    fill: 'forwards' as FillMode,
}

export function AlmaCharacter({ pose, mouthOpen, onClick }: AlmaCharacterProps) {
    const stageRef = useRef<HTMLSpanElement>(null)
    const headRef = useRef<HTMLSpanElement>(null)
    const leftArmRef = useRef<HTMLSpanElement>(null)
    const rightArmRef = useRef<HTMLSpanElement>(null)
    const leftLegRef = useRef<HTMLSpanElement>(null)
    const rightLegRef = useRef<HTMLSpanElement>(null)
    const [blinking, setBlinking] = useState(false)
    const expression = expressionByPose[pose]

    useEffect(() => {
        let blinkTimer: ReturnType<typeof setTimeout>
        let reopenTimer: ReturnType<typeof setTimeout>

        const scheduleBlink = () => {
            blinkTimer = setTimeout(() => {
                setBlinking(true)
                reopenTimer = setTimeout(() => {
                    setBlinking(false)
                    scheduleBlink()
                }, 135)
            }, 2600 + Math.round(Math.random() * 2400))
        }

        scheduleBlink()
        return () => {
            clearTimeout(blinkTimer)
            clearTimeout(reopenTimer)
        }
    }, [])

    useEffect(() => {
        const elements = [stageRef, headRef, leftArmRef, rightArmRef, leftLegRef, rightLegRef]
        elements.forEach((ref) => ref.current?.getAnimations().forEach((animation) => animation.cancel()))

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const animations: Animation[] = []
        const animate = (
            ref: React.RefObject<HTMLSpanElement | null>,
            keyframes: Keyframe[],
            options: KeyframeAnimationOptions,
        ) => {
            if (ref.current) animations.push(ref.current.animate(keyframes, options))
        }

        animate(stageRef, [
            { transform: 'translateY(0) scale(1)' },
            { transform: 'translateY(-2px) scale(1.006)' },
            { transform: 'translateY(0) scale(1)' },
        ], { duration: 4600, iterations: Infinity, easing: 'ease-in-out' })

        animate(headRef, [
            { transform: 'rotate(-1deg) translateY(0)' },
            { transform: 'rotate(1.5deg) translateY(-1px)' },
            { transform: 'rotate(-1deg) translateY(0)' },
        ], { duration: 6800, iterations: Infinity, easing: 'ease-in-out' })

        const settle = (ref: React.RefObject<HTMLSpanElement | null>, transform: string) => {
            animate(ref, [{ transform: 'rotate(0deg)' }, { transform }], motion)
        }

        switch (pose) {
            case 'wave':
                settle(headRef, 'rotate(-4deg) translateY(-2px)')
                animate(rightArmRef, [
                    { transform: 'rotate(0deg)' },
                    { transform: 'rotate(-126deg)' },
                    { transform: 'rotate(-112deg)' },
                    { transform: 'rotate(-132deg)' },
                    { transform: 'rotate(-116deg)' },
                ], { duration: 1750, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out' })
                break
            case 'point':
                settle(headRef, 'rotate(4deg) translateX(2px)')
                settle(rightArmRef, 'rotate(-82deg)')
                animate(rightArmRef, [
                    { transform: 'rotate(-82deg) translateX(0)' },
                    { transform: 'rotate(-79deg) translateX(2px)' },
                    { transform: 'rotate(-82deg) translateX(0)' },
                ], { duration: 2300, iterations: Infinity, easing: 'ease-in-out', delay: 720 })
                break
            case 'think':
                settle(headRef, 'rotate(-9deg) translate(-2px, 2px)')
                settle(leftArmRef, 'rotate(-148deg)')
                break
            case 'build':
                settle(headRef, 'rotate(3deg) translateY(1px)')
                settle(leftArmRef, 'rotate(-24deg)')
                settle(rightArmRef, 'rotate(28deg)')
                animate(stageRef, [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(1px)' },
                    { transform: 'translateY(0)' },
                ], { duration: 1700, iterations: Infinity, easing: 'ease-in-out', delay: 720 })
                break
            case 'plant':
                settle(headRef, 'rotate(-4deg) translateY(-1px)')
                settle(leftArmRef, 'rotate(-31deg)')
                settle(rightArmRef, 'rotate(34deg)')
                break
            case 'draw':
                settle(headRef, 'rotate(7deg) translate(2px, 2px)')
                settle(rightArmRef, 'rotate(-58deg)')
                animate(rightArmRef, [
                    { transform: 'rotate(-58deg) translateX(0)' },
                    { transform: 'rotate(-52deg) translateX(2px)' },
                    { transform: 'rotate(-62deg) translateX(-1px)' },
                ], { duration: 1400, iterations: Infinity, direction: 'alternate', easing: 'ease-in-out', delay: 720 })
                break
            case 'sit':
                settle(stageRef, 'translateY(8px) scale(.98)')
                settle(leftLegRef, 'rotate(7deg)')
                settle(rightLegRef, 'rotate(-7deg)')
                settle(headRef, 'rotate(-4deg)')
                break
            case 'walk':
                animate(leftLegRef, [
                    { transform: 'rotate(7deg)' },
                    { transform: 'rotate(-8deg)' },
                    { transform: 'rotate(7deg)' },
                ], { duration: 1250, iterations: Infinity, easing: 'ease-in-out' })
                animate(rightLegRef, [
                    { transform: 'rotate(-8deg)' },
                    { transform: 'rotate(7deg)' },
                    { transform: 'rotate(-8deg)' },
                ], { duration: 1250, iterations: Infinity, easing: 'ease-in-out' })
                animate(leftArmRef, [
                    { transform: 'rotate(-8deg)' },
                    { transform: 'rotate(10deg)' },
                    { transform: 'rotate(-8deg)' },
                ], { duration: 1250, iterations: Infinity, easing: 'ease-in-out' })
                animate(rightArmRef, [
                    { transform: 'rotate(10deg)' },
                    { transform: 'rotate(-8deg)' },
                    { transform: 'rotate(10deg)' },
                ], { duration: 1250, iterations: Infinity, easing: 'ease-in-out' })
                break
            case 'celebrate':
                settle(leftArmRef, 'rotate(126deg)')
                settle(rightArmRef, 'rotate(-126deg)')
                animate(stageRef, [
                    { transform: 'translateY(0)' },
                    { transform: 'translateY(-6px)' },
                    { transform: 'translateY(0)' },
                ], { duration: 1500, iterations: Infinity, easing: 'ease-in-out', delay: 720 })
                break
            default:
                animate(leftArmRef, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(1.5deg)' }, { transform: 'rotate(0deg)' }], { duration: 5200, iterations: Infinity, easing: 'ease-in-out' })
                animate(rightArmRef, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-1.5deg)' }, { transform: 'rotate(0deg)' }], { duration: 5200, iterations: Infinity, easing: 'ease-in-out' })
        }

        return () => animations.forEach((animation) => animation.cancel())
    }, [pose])

    const eyeScale = blinking ? 0.08 : expression === 'happy' ? 0.72 : 1
    const eyeOffset = expression === 'curious' ? 3 : expression === 'focused' ? -2 : 0

    return (
        <button
            type="button"
            className={styles.character}
            onClick={onClick}
            aria-label="Abrir la navegación asistida por Alma"
            title="Hablar con Alma"
        >
            <span ref={stageRef} className={styles.characterStage} aria-hidden="true">
                <RigLayer ref={leftLegRef} src="/alma/alma-leg-left.webp" className={styles.leftLeg} />
                <RigLayer ref={rightLegRef} src="/alma/alma-leg-right.webp" className={styles.rightLeg} />
                <RigLayer src="/alma/alma-core.webp" className={styles.coreLayer} />
                <RigLayer ref={leftArmRef} src="/alma/alma-arm-left.webp" className={styles.leftArm} />
                <RigLayer ref={rightArmRef} src="/alma/alma-arm-right.webp" className={styles.rightArm} />
                <span ref={headRef} className={styles.headLayer}>
                    <Image src="/alma/alma-head-neutral.webp" alt="" fill sizes="190px" priority />
                    <svg className={styles.faceLayer} viewBox="0 0 512 768" focusable="false">
                        <g
                            className={styles.eyeGroup}
                            style={{ transform: `translateY(${eyeOffset}px) scaleY(${eyeScale})` }}
                        >
                            <ellipse cx="225" cy="202" rx={expression === 'surprised' ? 13 : 10} ry={expression === 'surprised' ? 22 : 19} />
                            <ellipse cx="291" cy="202" rx={expression === 'surprised' ? 13 : 10} ry={expression === 'surprised' ? 22 : 19} />
                        </g>
                        <g className={`${styles.brows} ${styles[`expression_${expression}`]}`}>
                            <path d="M211 176 Q225 169 238 176" />
                            <path d="M278 176 Q291 169 305 176" />
                        </g>
                        {mouthOpen ? (
                            <ellipse className={styles.faceMouth} cx="258" cy="232" rx={expression === 'surprised' ? 12 : 18} ry={expression === 'surprised' ? 15 : 9} />
                        ) : (
                            <path
                                className={styles.faceSmile}
                                d={expression === 'focused'
                                    ? 'M239 231 Q258 235 277 231'
                                    : expression === 'curious'
                                        ? 'M236 228 Q257 244 281 225'
                                        : 'M231 223 Q258 250 285 223'}
                            />
                        )}
                    </svg>
                </span>
            </span>
            <span className="sr-only">Alma, asistente de navegación de Alma Verde Diseño</span>
        </button>
    )
}

interface RigLayerProps {
    src: string
    className: string
    ref?: React.Ref<HTMLSpanElement>
}

function RigLayer({ src, className, ref }: RigLayerProps) {
    return (
        <span ref={ref} className={`${styles.rigLayer} ${className}`}>
            <Image src={src} alt="" fill sizes="190px" priority />
        </span>
    )
}

