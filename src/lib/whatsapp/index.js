const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');

// =============================================
// CONFIGURATION
// =============================================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const KNOWLEDGE_DIR = path.join(__dirname, 'knowledge');
const KNOWLEDGE_FILE = path.join(KNOWLEDGE_DIR, 'base.txt');
const BEHAVIOR_FILE = path.join(KNOWLEDGE_DIR, 'behavior.txt');
// Place session in the root folder so it's not inside src
const SESSION_DIR = path.join(process.cwd(), '.whatsapp-session');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = SUPABASE_URL && SUPABASE_KEY ? createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// Ensure directories exist
if (!fs.existsSync(KNOWLEDGE_DIR)) fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

// Default knowledge base
if (!fs.existsSync(KNOWLEDGE_FILE)) {
    fs.writeFileSync(KNOWLEDGE_FILE, `Alma Verde Diseño es una agencia de diseño y productora de eventos.
Servicios: Stands para ferias, eventos corporativos, branding, decoración, muebles (Alma Home).
Teléfono: +57 XXX XXX XXXX
Email: centrodigitaldediseno@gmail.com`);
}

// Default behavior base
if (!fs.existsSync(BEHAVIOR_FILE)) {
    fs.writeFileSync(BEHAVIOR_FILE, `Eres el asistente virtual de Alma Verde Diseño por WhatsApp. 
Responde de forma amigable, profesional y concisa en español.
Usa emojis moderadamente.
Si el cliente pregunta por precios, invítalo a cotizar en almaverdediseno.com/cotizar o a enviar detalles de su proyecto.
Si detectas intención de compra o cotización, recopila: nombre, tipo de proyecto, presupuesto aproximado.`);
}

// =============================================
// GEMINI AI SETUP
// =============================================
let genAI = null;
let geminiModel = null;

if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini AI initialized for WhatsApp Bot');
} else {
    console.warn('⚠️ No GEMINI_API_KEY set. Bot will use fallback responses.');
}

// =============================================
// STATE
// =============================================
let sock = null;
let qrImage = null;
let connectionStatus = 'disconnected'; // 'disconnected' | 'qr_ready' | 'connected'
let autoReplyEnabled = true;
const conversationCache = new Map(); // phone -> [{ role, content }]

// =============================================
// KNOWLEDGE BASE
// =============================================
function getKnowledge() {
    try {
        return fs.readFileSync(KNOWLEDGE_FILE, 'utf-8');
    } catch {
        return '';
    }
}

function setKnowledge(text) {
    fs.writeFileSync(KNOWLEDGE_FILE, text, 'utf-8');
}

function getBehavior() {
    try {
        return fs.readFileSync(BEHAVIOR_FILE, 'utf-8');
    } catch {
        return '';
    }
}

function setBehavior(text) {
    fs.writeFileSync(BEHAVIOR_FILE, text, 'utf-8');
}

// =============================================
// GEMINI FUNCTIONS
// =============================================
async function getAIResponse(phone, userMessage) {
    if (!geminiModel) return 'Hola, gracias por escribirnos. Un asesor se comunicará contigo pronto. 🌿';

    // Get or create conversation history
    const history = conversationCache.get(phone) || [];
    history.push({ role: 'user', content: userMessage });

    // Keep last 10 messages for context
    if (history.length > 20) history.splice(0, history.length - 20);

    const knowledge = getKnowledge();
    const behavior = getBehavior();
    const systemPrompt = `${behavior}

BASE DE CONOCIMIENTOS:
${knowledge}

HISTORIAL DE CONVERSACIÓN:
${history.map(m => `${m.role === 'user' ? 'Cliente' : 'Bot'}: ${m.content}`).join('\n')}

Responde al último mensaje del cliente de forma natural y breve (máximo 3 párrafos cortos).`;

    try {
        const result = await geminiModel.generateContent(systemPrompt);
        const response = result.response.text();

        history.push({ role: 'assistant', content: response });
        conversationCache.set(phone, history);

        // Sync to Supabase
        if (supabase) {
            syncToSupabase(phone, history, userMessage);
        }

        return response;
    } catch (error) {
        console.error('Gemini error:', error);
        return 'Disculpa, estoy teniendo dificultades. Un asesor se comunicará contigo pronto. 🌿';
    }
}

async function transcribeAudio(audioBuffer) {
    if (!genAI) return null;

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const audioBase64 = audioBuffer.toString('base64');
        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: 'audio/ogg',
                    data: audioBase64,
                },
            },
            'Transcribe este audio de WhatsApp al español. Solo devuelve la transcripción, nada más.',
        ]);

        return result.response.text();
    } catch (error) {
        console.error('Audio transcription error:', error);
        return null;
    }
}

async function syncToSupabase(phone, history, lastUserMessage) {
    try {
        let intent = 'soporte';
        if (lastUserMessage.toLowerCase().includes('cotiza') || lastUserMessage.toLowerCase().includes('precio')) {
            intent = 'cotizacion';
        }

        const formattedPhone = phone.replace('@s.whatsapp.net', '');

        const { data: existing } = await supabase
            .from('whatsapp_leads')
            .select('id')
            .eq('phone', formattedPhone)
            .single();

        if (existing) {
            await supabase.from('whatsapp_leads').update({
                conversation: history,
                last_message: lastUserMessage,
                intent,
                updated_at: new Date().toISOString()
            }).eq('id', existing.id);
        } else {
            await supabase.from('whatsapp_leads').insert({
                phone: formattedPhone,
                conversation: history,
                last_message: lastUserMessage,
                intent,
                status: 'OPEN'
            });
        }
    } catch (error) {
        console.error('Supabase sync error:', error);
    }
}

// =============================================
// WHATSAPP CONNECTION (Baileys)
// =============================================
async function startWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Alma Verde Bot', 'Chrome', '4.0.0'],
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            const QRCode = require('qrcode');
            QRCode.toDataURL(qr, (err, url) => {
                if (!err) {
                    qrImage = url;
                    connectionStatus = 'qr_ready';
                    console.log('📱 QR code ready - scan from admin panel or terminal');
                }
            });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Connection closed, reconnecting:', shouldReconnect);
            connectionStatus = 'disconnected';
            qrImage = null;

            if (shouldReconnect) {
                setTimeout(startWhatsApp, 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ WhatsApp connected!');
            connectionStatus = 'connected';
            qrImage = null;
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async (m) => {
        if (!autoReplyEnabled) return;

        const msg = m.messages[0];
        if (!msg || msg.key.fromMe || !msg.message) return;

        const phone = msg.key.remoteJid;
        if (!phone || phone.includes('@g.us')) return; 

        try {
            let userMessage = '';

            if (msg.message.conversation) {
                userMessage = msg.message.conversation;
            } else if (msg.message.extendedTextMessage) {
                userMessage = msg.message.extendedTextMessage.text;
            } else if (msg.message.audioMessage) {
                console.log(`🎤 Audio received from ${phone}`);
                const buffer = await downloadMediaMessage(msg, 'buffer', {});
                const transcription = await transcribeAudio(buffer);
                
                if (transcription) {
                    userMessage = transcription;
                    await sock.sendMessage(phone, { text: `🎤 _Entendí tu audio:_ "${transcription}"\n\n` });
                    await new Promise(r => setTimeout(r, 1000)); 
                } else {
                    await sock.sendMessage(phone, {
                        text: '🎤 Recibí tu audio pero no pude procesarlo. ¿Podrías escribirme tu consulta? 😊'
                    });
                    return;
                }
            } else if (msg.message.imageMessage) {
                userMessage = msg.message.imageMessage.caption || 'El cliente envió una imagen.';
            } else {
                return;
            }

            if (!userMessage.trim()) return;

            console.log(`💬 ${phone}: ${userMessage}`);

            const response = await getAIResponse(phone, userMessage);
            await sock.sendMessage(phone, { text: response });
            console.log(`🤖 → ${phone}: ${response.substring(0, 100)}...`);

        } catch (error) {
            console.error('Message handling error:', error);
        }
    });
}

// =============================================
// INITIALIZE & MOUNT ROUTES
// =============================================
function initWhatsAppBot(app) {
    // Create a sub-router for WhatsApp API
    const botRouter = express.Router();
    botRouter.use(cors());
    botRouter.use(express.json());

    botRouter.get('/status', (req, res) => {
        res.json({
            status: connectionStatus,
            qr: qrImage,
            autoReply: autoReplyEnabled,
        });
    });

    botRouter.get('/qr', (req, res) => {
        if (qrImage) {
            res.json({ qr: qrImage });
        } else {
            res.status(404).json({ error: 'No QR available' });
        }
    });

    botRouter.post('/send', async (req, res) => {
        const { phone, message } = req.body;
        if (!sock || connectionStatus !== 'connected') {
            return res.status(400).json({ error: 'WhatsApp not connected' });
        }
        try {
            const jid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;
            await sock.sendMessage(jid, { text: message });
            res.json({ success: true });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    botRouter.post('/knowledge', (req, res) => {
        const { knowledge } = req.body;
        if (!knowledge) return res.status(400).json({ error: 'knowledge field required' });
        setKnowledge(knowledge);
        res.json({ success: true });
    });

    botRouter.get('/knowledge', (req, res) => {
        res.json({ knowledge: getKnowledge() });
    });

    botRouter.post('/behavior', (req, res) => {
        const { behavior } = req.body;
        if (!behavior) return res.status(400).json({ error: 'behavior field required' });
        setBehavior(behavior);
        res.json({ success: true });
    });

    botRouter.get('/behavior', (req, res) => {
        res.json({ behavior: getBehavior() });
    });

    botRouter.post('/restart', async (req, res) => {
        console.log('🔄 Restarting WhatsApp connection to clear session...');
        res.json({ success: true, message: 'Restarting in 2 seconds...' });
        
        setTimeout(() => {
            if (sock) {
                try { sock.logout(); } catch (e) {}
            }
            if (fs.existsSync(SESSION_DIR)) {
                fs.rmSync(SESSION_DIR, { recursive: true, force: true });
                console.log('🗑️ Session directory deleted.');
            }
            // In a custom Next.js server, killing the process will shut down Next.js too.
            // A better way is just to clear the directory and call startWhatsApp again:
            connectionStatus = 'disconnected';
            qrImage = null;
            setTimeout(() => {
                startWhatsApp();
                console.log('🔄 Session cleared, generating new QR code...');
            }, 1000);
        }, 2000);
    });

    botRouter.post('/toggle-auto-reply', (req, res) => {
        autoReplyEnabled = !autoReplyEnabled;
        res.json({ autoReply: autoReplyEnabled });
    });

    // Mount at /api/whatsapp
    app.use('/api/whatsapp', botRouter);

    // Start Baileys socket connection
    startWhatsApp();
}

module.exports = { initWhatsAppBot };
