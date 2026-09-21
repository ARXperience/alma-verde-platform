'use client'

import Image from 'next/image'
import type { AlmaPose } from './assistantContent'
import styles from './almaAssistant.module.css'

interface AlmaCharacterProps {
    pose: AlmaPose
    onClick: () => void
}

const poseAssets: Record<AlmaPose, string> = {
    idle: '/alma/ensamble-assistant.webp',
    wave: '/alma/ensamble-assistant.webp',
    point: '/alma/ensamble-assistant.webp',
    think: '/alma/ensamble-think.webp',
    build: '/alma/ensamble-build.webp',
    plant: '/alma/ensamble-plant.webp',
    draw: '/alma/ensamble-build.webp',
    sit: '/alma/ensamble-think.webp',
    walk: '/alma/ensamble-assistant.webp',
    celebrate: '/alma/ensamble-celebrate.webp',
}

export function AlmaCharacter({ pose, onClick }: AlmaCharacterProps) {
    return (
        <button
            type="button"
            className={`${styles.character} ${styles[`pose_${pose}`]}`}
            onClick={onClick}
            aria-label="Abrir la navegación asistida por Ensamble"
            title="Hablar con Ensamble"
        >
            <span className={styles.characterStage} aria-hidden="true">
                <Image
                    src={poseAssets[pose]}
                    alt=""
                    fill
                    sizes="128px"
                    priority
                    className={styles.characterImage}
                />
            </span>
            <span className="sr-only">Ensamble, asistente de navegación de Alma Verde Diseño</span>
        </button>
    )
}

