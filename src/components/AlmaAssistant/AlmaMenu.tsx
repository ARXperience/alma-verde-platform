import { ArrowUpRight, X } from 'lucide-react'
import { navigationOptions } from './assistantContent'
import styles from './almaAssistant.module.css'

interface AlmaMenuProps {
    open: boolean
    onClose: () => void
    onNavigate: (href: string) => void
}

export function AlmaMenu({ open, onClose, onNavigate }: AlmaMenuProps) {
    if (!open) return null

    return (
        <div className={styles.menu} role="dialog" aria-modal="false" aria-label="Navegación asistida por Ensamble">
            <div className={styles.menuHeader}>
                <div>
                    <span>Ensamble te orienta</span>
                    <h2>¿Te ayudo a encontrar algo?</h2>
                </div>
                <button type="button" onClick={onClose} aria-label="Cerrar menú de Ensamble">
                    <X aria-hidden="true" size={16} />
                </button>
            </div>
            <div className={styles.menuOptions}>
                {navigationOptions.map((option) => (
                    <button key={option.href} type="button" onClick={() => onNavigate(option.href)}>
                        <span>{option.label}</span>
                        <ArrowUpRight aria-hidden="true" size={15} />
                    </button>
                ))}
            </div>
        </div>
    )
}
