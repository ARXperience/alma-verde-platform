'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Loader2, MessageSquare, Phone, User, Clock, Bot, User as UserIcon } from 'lucide-react'

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

interface WhatsAppLead {
    id: string
    phone: string
    name: string | null
    last_message: string
    conversation: ChatMessage[]
    intent: string
    status: string
    updated_at: string
}

export default function WhatsAppConversationsPage() {
    const [leads, setLeads] = useState<WhatsAppLead[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedLead, setSelectedLead] = useState<WhatsAppLead | null>(null)

    useEffect(() => {
        fetchLeads()
    }, [])

    async function fetchLeads() {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('whatsapp_leads')
                .select('*')
                .order('updated_at', { ascending: false })

            if (error) throw error
            setLeads(data || [])
            if (data && data.length > 0 && !selectedLead) {
                setSelectedLead(data[0])
            }
        } catch (error) {
            console.error('Error fetching leads:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLeads = leads.filter(l => 
        l.phone.includes(searchTerm) || 
        (l.name && l.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (l.last_message && l.last_message.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="p-8 max-w-[1400px] mx-auto h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-4xl font-black text-[#102216] tracking-tight flex items-center gap-3">
                    <MessageSquare className="w-8 h-8" />
                    Mensajes WhatsApp
                </h1>
                <p className="text-slate-500 mt-1">Supervisa las conversaciones entre la Inteligencia Artificial y los clientes.</p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
                {/* Contact List */}
                <Card className="border-none shadow-sm rounded-3xl bg-white flex flex-col min-h-0">
                    <CardHeader className="pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input 
                                placeholder="Buscar número o mensaje..." 
                                className="pl-10 rounded-xl bg-slate-50 border-none"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <div className="flex-1 px-4 pb-4 overflow-y-auto">
                        <div className="space-y-2">
                            {filteredLeads.length === 0 ? (
                                <p className="text-center text-slate-400 text-sm py-8">No hay conversaciones</p>
                            ) : (
                                filteredLeads.map(lead => (
                                    <button
                                        key={lead.id}
                                        onClick={() => setSelectedLead(lead)}
                                        className={`w-full text-left p-4 rounded-2xl transition-all ${
                                            selectedLead?.id === lead.id 
                                                ? 'bg-[#102216] text-white shadow-md' 
                                                : 'hover:bg-slate-50 bg-white border border-slate-100 text-slate-700'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold flex items-center gap-2 text-sm">
                                                <Phone className="w-3 h-3" />
                                                +{lead.phone}
                                            </p>
                                            <span className="text-[10px] opacity-70">
                                                {new Date(lead.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={`text-xs line-clamp-2 ${selectedLead?.id === lead.id ? 'text-slate-300' : 'text-slate-500'}`}>
                                            {lead.last_message || 'Sin mensajes'}
                                        </p>
                                        {lead.intent === 'cotizacion' && (
                                            <Badge className={`mt-3 text-[10px] ${selectedLead?.id === lead.id ? 'bg-[#13ec5b] text-[#102216]' : 'bg-green-100 text-green-700'}`}>
                                                Quiere Cotizar
                                            </Badge>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </Card>

                {/* Chat Viewer */}
                <Card className="border-none shadow-sm rounded-3xl bg-white lg:col-span-2 flex flex-col min-h-0 bg-[#f0f2f5]">
                    {selectedLead ? (
                        <>
                            {/* Chat Header */}
                            <CardHeader className="bg-white border-b border-slate-100 py-4 flex-row items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg">+{selectedLead.phone}</CardTitle>
                                        <CardDescription className="text-xs flex items-center gap-1">
                                            <Bot className="w-3 h-3" /> Atendido por IA
                                        </CardDescription>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Badge variant="outline" className="bg-white">
                                        Intención: <span className="font-bold ml-1 uppercase">{selectedLead.intent}</span>
                                    </Badge>
                                </div>
                            </CardHeader>

                            {/* Chat Messages */}
                            <div className="flex-1 p-6 overflow-y-auto">
                                <div className="space-y-4 max-w-3xl mx-auto">
                                    {selectedLead.conversation?.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[80%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                                                msg.role === 'user' 
                                                    ? 'bg-white text-slate-800 rounded-tl-none border border-slate-100' 
                                                    : 'bg-[#dcf8c6] text-[#102216] rounded-tr-none'
                                            }`}>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                                <div className="flex items-center justify-end gap-1 mt-1 opacity-50">
                                                    {msg.role === 'assistant' ? <Bot className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedLead.conversation || selectedLead.conversation.length === 0) && (
                                        <div className="text-center text-slate-400 py-10 bg-white/50 rounded-2xl">
                                            Historial vacío
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Chat Footer */}
                            <div className="p-4 bg-white border-t border-slate-100 text-center">
                                <p className="text-xs text-slate-400 flex items-center justify-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    Modo Solo Lectura. Las respuestas manuales deben hacerse desde la app oficial de WhatsApp.
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl">
                            <MessageSquare className="w-16 h-16 opacity-20 mb-4" />
                            <p className="font-medium">Selecciona una conversación</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
