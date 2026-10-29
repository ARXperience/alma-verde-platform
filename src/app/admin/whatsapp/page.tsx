'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'
import { ArrowLeft, Bot, FileText, Loader2, MessageSquare, User } from 'lucide-react'
import { FilterChip, PageHeader, Pill, SearchBox } from '@/components/admin/ui'
import { LEAD_INTENTS, nameOf, whatsappContact } from '@/lib/admin/labels'
import { timeAgo } from '@/lib/projects/display'

interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
}

interface Lead {
    id: string
    phone: string
    name: string | null
    last_message: string | null
    conversation: ChatMessage[] | null
    intent: string | null
    quotation_id: string | null
    updated_at: string
}

export default function WhatsAppConversationsPage() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [intent, setIntent] = useState('all')
    const [selectedId, setSelectedId] = useState<string | null>(null)

    useEffect(() => {
        supabase.from('whatsapp_leads').select('*').order('updated_at', { ascending: false }).then(({ data, error }) => {
            if (error) console.error('Error fetching leads:', error)
            // The bot also stores WhatsApp status updates (status@broadcast); they are not conversations
            setLeads(((data || []) as Lead[]).filter(l => !whatsappContact(l.phone).broadcast))
            setLoading(false)
        })
    }, [])

    const term = search.trim().toLowerCase()
    const matches = leads.filter(l =>
        !term || [l.phone, l.name, l.last_message].some(v => v?.toLowerCase().includes(term))
    )
    const visible = intent === 'all' ? matches : matches.filter(l => l.intent === intent)
    const intents = [...new Set(leads.map(l => l.intent).filter(Boolean))] as string[]
    const selected = leads.find(l => l.id === selectedId) || null

    return (
        <div className="mx-auto flex h-full max-w-[1400px] flex-col p-4 sm:p-6 lg:p-8">
            <PageHeader
                eyebrow="Ventas"
                title="WhatsApp"
                description="Conversaciones que atiende la inteligencia artificial. Solo lectura: para responder, usa la app de WhatsApp."
            />

            {loading ? (
                <div className="flex justify-center p-16"><Loader2 className="h-8 w-8 animate-spin text-[#13ec5b]" /></div>
            ) : (
                <div className="grid min-h-[560px] flex-1 grid-cols-1 gap-6 lg:grid-cols-3 lg:min-h-0">
                    {/* Conversations */}
                    <section className={`flex min-h-0 flex-col rounded-3xl bg-white p-4 shadow-sm ${selected ? 'hidden lg:flex' : 'flex'}`}>
                        <SearchBox value={search} onChange={setSearch} placeholder="Buscar contacto o mensaje…" />
                        <div className="mt-3 flex flex-wrap gap-2">
                            <FilterChip active={intent === 'all'} onClick={() => setIntent('all')} label="Todas" count={matches.length} />
                            {intents.map(i => (
                                <FilterChip key={i} active={intent === i} onClick={() => setIntent(i)} label={nameOf(LEAD_INTENTS, i)} count={matches.filter(l => l.intent === i).length} />
                            ))}
                        </div>
                        <div className="mt-4 flex-1 space-y-2 overflow-y-auto">
                            {visible.length === 0 && <p className="py-10 text-center text-sm text-slate-400">No hay conversaciones</p>}
                            {visible.map(lead => {
                                const contact = whatsappContact(lead.phone)
                                const active = lead.id === selectedId
                                return (
                                    <button
                                        key={lead.id}
                                        onClick={() => setSelectedId(lead.id)}
                                        className={`w-full rounded-2xl p-4 text-left transition-colors ${active ? 'bg-[#102216] text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                                    >
                                        <div className="mb-1 flex items-start justify-between gap-2">
                                            <p className="truncate text-sm font-bold">{lead.name || contact.label}</p>
                                            <span className={`flex-none text-[11px] ${active ? 'text-white/60' : 'text-slate-400'}`}>{timeAgo(lead.updated_at)}</span>
                                        </div>
                                        <p className={`line-clamp-2 text-xs ${active ? 'text-white/70' : 'text-slate-500'}`}>{lead.last_message || 'Sin mensajes'}</p>
                                        {lead.intent && (
                                            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${lead.intent === 'cotizacion' ? 'bg-[#13ec5b] text-[#102216]' : active ? 'bg-white/10 text-white/80' : 'bg-white text-slate-500'}`}>
                                                {nameOf(LEAD_INTENTS, lead.intent)}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    {/* Chat */}
                    <section className={`min-h-0 flex-col overflow-hidden rounded-3xl bg-[#efeae2] shadow-sm lg:col-span-2 ${selected ? 'flex' : 'hidden lg:flex'}`}>
                        {selected ? <Chat lead={selected} onBack={() => setSelectedId(null)} /> : (
                            <div className="flex flex-1 flex-col items-center justify-center bg-white text-slate-400">
                                <MessageSquare className="mb-4 h-14 w-14 opacity-20" />
                                <p className="font-medium">Elige una conversación para leerla</p>
                            </div>
                        )}
                    </section>
                </div>
            )}
        </div>
    )
}

function Chat({ lead, onBack }: { lead: Lead; onBack: () => void }) {
    const contact = whatsappContact(lead.phone)
    return (
        <>
            <header className="flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-3 md:px-6">
                <div className="flex min-w-0 items-center gap-3">
                    <button onClick={onBack} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Volver a la lista">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="grid h-10 w-10 flex-none place-items-center rounded-full bg-slate-100"><User className="h-5 w-5 text-slate-400" /></div>
                    <div className="min-w-0">
                        <p className="truncate font-bold text-[#102216]">{lead.name || contact.label}</p>
                        <p className="flex items-center gap-1 text-xs text-slate-500"><Bot className="h-3 w-3" /> Atendido por la IA · {timeAgo(lead.updated_at)}</p>
                    </div>
                </div>
                <div className="flex flex-none items-center gap-2">
                    {lead.intent && <span className="hidden sm:inline"><Pill tone={lead.intent === 'cotizacion' ? 'green' : 'slate'}>{nameOf(LEAD_INTENTS, lead.intent)}</Pill></span>}
                    {lead.quotation_id && (
                        <Link href={`/admin/quotations/${lead.quotation_id}`} className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            <FileText className="h-4 w-4" /> Cotización
                        </Link>
                    )}
                    {contact.phone && (
                        <a href={`https://wa.me/${contact.phone}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#13ec5b] px-3 text-xs font-bold text-[#102216] hover:bg-[#13ec5b]/90">
                            <MessageSquare className="h-4 w-4" /> Responder
                        </a>
                    )}
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mx-auto max-w-3xl space-y-3">
                    {(lead.conversation || []).map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user' ? 'rounded-tl-none bg-white text-slate-800' : 'rounded-tr-none bg-[#d9fdd3] text-[#102216]'}`}>
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <p className="mt-1 text-right text-[10px] font-semibold uppercase tracking-wider opacity-40">{msg.role === 'user' ? 'Cliente' : 'IA'}</p>
                            </div>
                        </div>
                    ))}
                    {!lead.conversation?.length && <p className="rounded-2xl bg-white/60 py-10 text-center text-slate-400">Sin mensajes guardados</p>}
                </div>
            </div>
            {!contact.phone && (
                <p className="border-t border-slate-100 bg-white px-4 py-3 text-center text-xs text-slate-400">
                    WhatsApp ocultó el número de este contacto. Respóndele desde la app de WhatsApp del negocio.
                </p>
            )}
        </>
    )
}
