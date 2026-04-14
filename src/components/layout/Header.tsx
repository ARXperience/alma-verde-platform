'use client'

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/contexts/CartContext"
import { CartSheet } from "@/components/store/CartSheet"

const navigation = [
    { name: 'Proyectos', href: '/portafolio' },
    { name: 'Servicios', href: '/servicios' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Tienda', href: '/tienda' },
    { name: 'Contacto', href: '/contacto' },
]

export function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { setIsOpen, cartCount } = useCart()

    return (
        <header className="sticky top-0 z-50 bg-[#f6f8f6]/80 dark:bg-[#102216]/80 backdrop-blur-md border-b border-slate-200/30 dark:border-slate-700/30 px-6 lg:px-20 py-4">
            <nav className="flex items-center justify-between" aria-label="Global">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#13ec5b] text-3xl">eco</span>
                    <Link href="/" className="text-xl font-extrabold tracking-tight uppercase font-display">
                        Alma Verde <span className="text-[#13ec5b]">Diseño</span>
                    </Link>
                </div>

                <div className="hidden md:flex items-center gap-10">
                    {navigation.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="text-sm font-semibold hover:text-[#13ec5b] transition-colors"
                        >
                            {item.name}
                        </a>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="relative">
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href="/auth/login">Iniciar Sesión</Link>
                    </Button>
                    <Link
                        href="/cotizar"
                        className="bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#111813] px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                    >
                        Cotizar
                    </Link>
                </div>

                {/* Mobile */}
                <div className="flex md:hidden items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="relative">
                        <ShoppingCart className="h-5 w-5" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </Button>
                    <button onClick={() => setMobileMenuOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </nav>

            <CartSheet />

            {/* Mobile menu */}
            <div className={cn(
                "md:hidden fixed inset-0 z-50 transition-opacity duration-300",
                mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                <div className={cn(
                    "fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#f6f8f6] dark:bg-[#102216] px-6 py-6 sm:max-w-sm transition-transform duration-300",
                    mobileMenuOpen ? "translate-x-0" : "translate-x-full"
                )}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#13ec5b] text-3xl">eco</span>
                            <span className="text-xl font-extrabold tracking-tight uppercase font-display">
                                Alma Verde <span className="text-[#13ec5b]">Diseño</span>
                            </span>
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)}>
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="mt-6 space-y-2">
                        {navigation.map((item) => (
                            <a
                                key={item.name}
                                href={item.href}
                                className="block rounded-lg px-3 py-2 text-base font-semibold hover:bg-[#13ec5b]/10"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.name}
                            </a>
                        ))}
                        <div className="pt-6 space-y-2 border-t border-slate-200 dark:border-slate-700">
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/auth/login">Iniciar Sesión</Link>
                            </Button>
                            <Link
                                href="/cotizar"
                                className="block w-full text-center bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#111813] px-6 py-2.5 rounded-lg font-bold text-sm transition-all"
                            >
                                Cotizar Proyecto
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}
