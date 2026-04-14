// Simplified version of shadcn/ui use-toast
import { useState, useEffect } from "react"

export interface Toast {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: "default" | "destructive"
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])

    function toast({ title, description, variant = "default" }: Omit<Toast, "id">) {
        const id = Math.random().toString(36).substring(2, 9)
        const newToast = { id, title, description, variant }
        setToasts((prev) => [...prev, newToast])

        // In a real app this would use a Context, but for now we just log or alert if critical
        console.log("Toast:", title, description)
        if (variant === 'destructive') {
            alert(`${title}: ${description}`)
        }
    }

    return {
        toast,
        toasts,
        dismiss: (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id)),
    }
}
