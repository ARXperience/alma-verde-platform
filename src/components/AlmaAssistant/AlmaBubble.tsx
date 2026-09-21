'use client'

import { useState } from 'react'
import { ChevronDown, Minus, X } from 'lucide-react'
import styles from './almaAssistant.module.css'

interface AlmaBubbleProps {
    message: string
    visible: boolean
    onClose: () => void
    onMinimize: () => void
}

export function AlmaBubble({ message, visible, onClose, onMinimize }: AlmaBubbleProps) {
    const [expanded, setExpanded] = useState(false)

    return (
        <aside
            className={`${styles.bubble} ${expanded ? styles.bubbleExpanded : ''} ${visible ? styles.bubbleVisible : ''}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className={styles.bubbleHeader}>
                <span>Alma observa</span>
                <div className={styles.bubbleActions}>
                    <button type="button" onClick={onMinimize} aria-label="Minimizar a Alma">
                        <Minus aria-hidden="true" size={13} />
                    </button>
                    <button type="button" onClick={onClose} aria-label="Cerrar este mensaje">
                        <X aria-hidden="true" size={13} />
                    </button>
                </div>
            </div>
            <p className={expanded ? '' : styles.bubbleTextCompact}>{message}</p>
            <button
                type="button"
                className={styles.readButton}
                onClick={() => setExpanded((current) => !current)}
                aria-expanded={expanded}
            >
                {expanded ? 'Mostrar menos' : 'Leer completo'}
                <ChevronDown aria-hidden="true" size={12} className={expanded ? styles.chevronExpanded : ''} />
            </button>
        </aside>
    )
}

