'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
    id: string
    content: string
    isAI: boolean
    timestamp: Date
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: '¡Hola! Soy el asistente de Alma Verde. ¿En qué proyecto puedo ayudarte hoy?',
            isAI: true,
            timestamp: new Date(),
        }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSend = async () => {
        if (!input.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: input,
            isAI: false,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setLoading(true)

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        ...messages.map(m => ({
                            role: m.isAI ? 'model' : 'user',
                            content: m.content
                        })),
                        { role: 'user', content: input }
                    ]
                })
            })

            if (!response.ok) throw new Error('Failed to send message')

            const data = await response.json()

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.message,
                isAI: true,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, aiMessage])
        } catch (error) {
            console.error('Chat error:', error)
            // Error feedback to user
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Lo siento, tuve un problema al procesar tu mensaje. ¿Podrías intentarlo de nuevo?',
                isAI: true,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={cn(
                    "fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full gradient-primary shadow-2xl flex items-center justify-center transform hover:scale-110 transition-all glow-primary",
                    isOpen && "hidden"
                )}
            >
                <MessageCircle className="w-7 h-7 text-white" />
            </button>

            {/* Chat Window */}
            <div className={cn(
                "fixed bottom-6 right-6 z-50 w-full max-w-md transition-all duration-300",
                isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
            )}>
                <Card className="glass border-white/20 shadow-2xl overflow-hidden">
                    <CardHeader className="gradient-primary text-white p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">Asistente IA</CardTitle>
                                    <p className="text-xs text-white/80">Siempre disponible</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Messages */}
                        <div className="h-96 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex",
                                        message.isAI ? "justify-start" : "justify-end"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-2",
                                            message.isAI
                                                ? "bg-muted text-foreground"
                                                : "gradient-primary text-white"
                                        )}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-muted rounded-2xl px-4 py-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
                                            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-border">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Escribe tu mensaje..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    disabled={loading}
                                />
                                <Button
                                    onClick={handleSend}
                                    disabled={loading || !input.trim()}
                                    size="icon"
                                    variant="gradient"
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2 text-center">
                                Potenciado por IA • Respuestas instantáneas
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}
