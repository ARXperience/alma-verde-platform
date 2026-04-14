'use client'

import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function CartSheet() {
    const { items, removeItem, updateQuantity, cartTotal, isOpen, setIsOpen } = useCart()

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setIsOpen(false)}
            />

            {/* Sheet */}
            <div className={cn(
                "relative w-full max-w-md bg-white dark:bg-gray-900 h-full shadow-xl flex flex-col transform transition-transform duration-300 ease-in-out",
                isOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Tu Carrito
                    </h2>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
                            <ShoppingBag className="w-16 h-16 opacity-20" />
                            <p className="text-lg font-medium">El carrito está vacío</p>
                            <Button variant="link" onClick={() => setIsOpen(false)}>
                                Continuar comprando
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        src={item.image || '/placeholder-product.jpg'}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                                        <p className="text-xs text-gray-500">{item.businessUnit === 'ALMA_HOME' ? 'Alma Home' : 'Alma Verde'}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center border rounded-md h-8">
                                            <button
                                                className="px-2 hover:bg-gray-100 disabled:opacity-50 h-full flex items-center"
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <button
                                                className="px-2 hover:bg-gray-100 h-full flex items-center"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-sm">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-gray-400 hover:text-red-500 self-start"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-gray-500">Total estimado</span>
                            <span className="text-2xl font-bold">{formatCurrency(cartTotal)}</span>
                        </div>
                        <Button className="w-full h-12 text-lg" asChild>
                            <Link href="/checkout" onClick={() => setIsOpen(false)}>
                                Finalizar Compra
                            </Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
