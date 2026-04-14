'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sparkles, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { signIn } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const redirectTo = searchParams.get('redirect') || '/dashboard'

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
            router.push(redirectTo)
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <Alert className="bg-red-500/10 border-red-500/50 text-red-200">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200 ml-1">Correo Electrónico</Label>
                <div className="relative">
                    <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-11 h-12 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#13ec5b] focus-visible:border-[#13ec5b] rounded-xl"
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                    <Label htmlFor="password" className="text-slate-200">Contraseña</Label>
                    <Link
                        href="/auth/forgot-password"
                        className="text-sm text-[#13ec5b] hover:text-[#13ec5b]/80 transition-colors"
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>
                <div className="relative">
                    <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-11 h-12 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-[#13ec5b] focus-visible:border-[#13ec5b] rounded-xl"
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] font-bold text-lg rounded-xl mt-4 transition-all hover:scale-[1.02] shadow-lg shadow-[#13ec5b]/20"
                disabled={loading}
            >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
        </form>
    )
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#102216] relative overflow-hidden p-4 font-display">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#13ec5b]/10 blur-[120px] rounded-full mix-blend-screen animate-pulse duration-10000" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#61896f]/20 blur-[150px] rounded-full mix-blend-screen animate-pulse delay-5000" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="flex justify-center mb-10">
                    <Link href="/" className="flex flex-col items-center gap-4 group">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#13ec5b] to-[#0a8c35] flex items-center justify-center transform group-hover:scale-105 transition-all shadow-lg shadow-[#13ec5b]/30">
                            <Sparkles className="w-8 h-8 text-[#102216]" />
                        </div>
                        <span className="text-3xl font-black text-white tracking-tight">
                            Alma Verde
                        </span>
                    </Link>
                </div>

                {/* Glassmorphism Card */}
                <Card className="bg-white/5 backdrop-blur-2xl border-white/10 shadow-2xl rounded-3xl overflow-hidden text-white">
                    <CardHeader className="space-y-2 pb-6 pt-8 px-8">
                        <CardTitle className="text-2xl font-bold text-center">Bienvenido de nuevo</CardTitle>
                        <CardDescription className="text-center text-slate-300">
                            Ingresa tus credenciales para acceder a tu panel
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-8">
                        <Suspense fallback={<div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-[#13ec5b]"/></div>}>
                            <LoginForm />
                        </Suspense>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pb-8 pt-4 px-8 border-t border-white/10 mt-6 bg-black/10">
                        <div className="text-sm text-center text-slate-300">
                            ¿No tienes una cuenta?{' '}
                            <Link href="/auth/register" className="text-[#13ec5b] hover:text-white transition-colors font-bold">
                                Regístrate aquí
                            </Link>
                        </div>
                        <div className="text-sm text-center">
                            <Link href="/" className="text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">arrow_back</span> Volver al inicio
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
}
