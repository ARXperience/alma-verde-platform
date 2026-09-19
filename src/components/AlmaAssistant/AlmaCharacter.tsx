'use client'

import Image from 'next/image'
import type { AlmaPose } from './assistantContent'
import styles from './almaAssistant.module.css'

interface AlmaCharacterProps {
    pose: AlmaPose
    mouthOpen: boolean
    onClick: () => void
}

export function AlmaCharacter({ pose, mouthOpen, onClick }: AlmaCharacterProps) {
    return (
        <button
            type="button"
            className={`${styles.character} ${styles[`pose_${pose}`]}`}
            onClick={onClick}
            aria-label="Abrir la navegación asistida por Alma"
            title="Hablar con Alma"
        >
            <span className={styles.characterStage} aria-hidden="true">
                <Image
                    src="/alma/alma-body.webp"
                    alt=""
                    fill
                    sizes="190px"
                    priority
                    className={styles.bodyLayer}
                />
                <span className={styles.headLayer}>
                    <Image
                        src="/alma/alma-head.webp"
                        alt=""
                        fill
                        sizes="190px"
                        priority
                    />
                    <span className={`${styles.mouth} ${mouthOpen ? styles.mouthOpen : ''}`} />
                </span>
            </span>
            <span className="sr-only">Alma, asistente de navegación de Alma Verde Diseño</span>
        </button>
    )
}

