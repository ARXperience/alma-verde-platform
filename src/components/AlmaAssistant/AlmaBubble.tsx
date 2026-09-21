import { Minus, X } from 'lucide-react'
import styles from './almaAssistant.module.css'

interface AlmaBubbleProps {
    message: string
    visible: boolean
    onClose: () => void
    onMinimize: () => void
}

export function AlmaBubble({ message, visible, onClose, onMinimize }: AlmaBubbleProps) {
    return (
        <aside
            className={`${styles.bubble} ${visible ? styles.bubbleVisible : ''}`}
            role="status"
            aria-live="polite"
            aria-atomic="true"
        >
            <div className={styles.bubbleHeader}>
                <span>Una nota de Alma</span>
                <div className={styles.bubbleActions}>
                    <button type="button" onClick={onMinimize} aria-label="Minimizar a Alma">
                        <Minus aria-hidden="true" size={14} />
                    </button>
                    <button type="button" onClick={onClose} aria-label="Cerrar este mensaje">
                        <X aria-hidden="true" size={14} />
                    </button>
                </div>
            </div>
            <p>{message}</p>
        </aside>
    )
}

