'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
    id: string
    productId: string
    name: string
    price: number
    image: string
    quantity: number
    businessUnit: string
    slug: string
}

interface CartContextType {
    items: CartItem[]
    addItem: (item: Omit<CartItem, 'id'>) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
    cartCount: number
    cartTotal: number
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('alma-verde-cart')
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart))
            } catch (e) {
                console.error('Failed to parse cart', e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save to local storage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('alma-verde-cart', JSON.stringify(items))
        }
    }, [items, isLoaded])

    const addItem = (newItem: Omit<CartItem, 'id'>) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.productId === newItem.productId)

            if (existingItem) {
                return currentItems.map(item =>
                    item.productId === newItem.productId
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                )
            }

            return [...currentItems, { ...newItem, id: `${newItem.productId}-${Date.now()}` }]
        })
        setIsOpen(true)
    }

    const removeItem = (id: string) => {
        setItems(currentItems => currentItems.filter(item => item.id !== id))
    }

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return
        setItems(currentItems =>
            currentItems.map(item =>
                item.id === id ? { ...item, quantity } : item
            )
        )
    }

    const clearCart = () => {
        setItems([])
    }

    const cartCount = items.reduce((total, item) => total + item.quantity, 0)
    const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0)

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            isOpen,
            setIsOpen
        }}>
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}
