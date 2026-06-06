const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

// =============================================
// CONFIGURATION
// =============================================
const PORT = process.env.WHATSAPP_BOT_PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const KNOWLEDGE_FILE = path.join(__dirname, 'knowledge', 'base.txt');
const SESSION_DIR = path.join(__dirname, 'session');

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, 'knowledge'))) fs.mkdirSync(path.join(__dirname, 'knowledge'), { recursive: true });
if (!fs.existsSync(SESSION_DIR)) fs.mkdirSync(SESSION_DIR, { recursive: true });

// Default knowledge base
if (!fs.existsSync(KNOWLEDGE_FILE)) {
    fs.writeFileSync(KNOWLEDGE_FILE, `Alma Verde Diseño es una agencia de diseño y productora de eventos.
Servicios: Stands para ferias, eventos corporativos, branding, decoración, muebles (Alma Home).
Teléfono: +57 XXX XXX XXXX
Email: centrodigitaldediseno@gmail.com
Web: almaverdediseno.com`);
}

// =============================================
// GEMINI AI SETUP
// =============================================
let genAI = null;
let geminiModel = null;

if (GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('✅ Gemini AI initialized');
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
    const systemPrompt = `Eres el asistente virtual de Alma Verde Diseño por WhatsApp. 
Responde de forma amigable, profesional y concisa en español.
Usa emojis moderadamente.
Si el cliente pregunta por precios, invítalo a cotizar en almaverdediseno.com/cotizar o a enviar detalles de su proyecto.
Si detectas intención de compra o cotización, recopila: nombre, tipo de proyecto, presupuesto aproximado.

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

        return response;
    } catch (error) {
        console.error('Gemini error:', error);
        return 'Disculpa, estoy teniendo dificultades. Un asesor se comunicará contigo pronto. 🌿';
    }
}

async function transcribeAudio(audioBuffer) {
    if (!genAI) return null;

    try {
        // Gemini can process audio directly
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

    // Connection updates
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            // Convert QR to data URL for the admin panel
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

    // Save credentials
    sock.ev.on('creds.update', saveCreds);

    // Message handler
    sock.ev.on('messages.upsert', async (m) => {
        if (!autoReplyEnabled) return;

        const msg = m.messages[0];
        if (!msg || msg.key.fromMe || !msg.message) return;

        const phone = msg.key.remoteJid;
        if (!phone || phone.includes('@g.us')) return; // Skip group messages

        try {
            let userMessage = '';

            // Text message
            if (msg.message.conversation) {
                userMessage = msg.message.conversation;
            } else if (msg.message.extendedTextMessage) {
                userMessage = msg.message.extendedTextMessage.text;
            }
            // Audio message
            else if (msg.message.audioMessage) {
                console.log(`🎤 Audio received from ${phone}`);
                
                // Download audio
                const buffer = await downloadMediaMessage(msg, 'buffer', {});
                
                // Transcribe with Gemini
                const transcription = await transcribeAudio(buffer);
                
                if (transcription) {
                    userMessage = transcription;
                    // Let the user know we understood their audio
                    await sock.sendMessage(phone, { text: `🎤 _Entendí tu audio:_ "${transcription}"\n\n` });
                    await new Promise(r => setTimeout(r, 1000)); // Small delay
                } else {
                    await sock.sendMessage(phone, {
                        text: '🎤 Recibí tu audio pero no pude procesarlo. ¿Podrías escribirme tu consulta? 😊'
                    });
                    return;
                }
            }
            // Image or other media
            else if (msg.message.imageMessage) {
                userMessage = msg.message.imageMessage.caption || 'El cliente envió una imagen.';
            }
            // Unsupported message type
            else {
                return;
            }

            if (!userMessage.trim()) return;

            console.log(`💬 ${phone}: ${userMessage}`);

            // Get AI response
            const response = await getAIResponse(phone, userMessage);

            // Send response
            await sock.sendMessage(phone, { text: response });

            console.log(`🤖 → ${phone}: ${response.substring(0, 100)}...`);

        } catch (error) {
            console.error('Message handling error:', error);
        }
    });
}

// =============================================
// EXPRESS API SERVER
// =============================================
const app = express();
app.use(cors());
app.use(express.json());

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        status: connectionStatus,
        qr: qrImage,
        autoReply: autoReplyEnabled,
    });
});

// QR code endpoint
app.get('/qr', (req, res) => {
    if (qrImage) {
        res.json({ qr: qrImage });
    } else {
        res.status(404).json({ error: 'No QR available' });
    }
});

// Send message endpoint
app.post('/send', async (req, res) => {
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

// Knowledge base endpoint
app.post('/knowledge', (req, res) => {
    const { knowledge } = req.body;
    if (!knowledge) return res.status(400).json({ error: 'knowledge field required' });
    setKnowledge(knowledge);
    res.json({ success: true });
});

app.get('/knowledge', (req, res) => {
    res.json({ knowledge: getKnowledge() });
});

// Toggle auto-reply
app.post('/toggle-auto-reply', (req, res) => {
    autoReplyEnabled = !autoReplyEnabled;
    res.json({ autoReply: autoReplyEnabled });
});

// =============================================
// START
// =============================================
app.listen(PORT, () => {
    console.log(`🚀 WhatsApp Bot API running on port ${PORT}`);
    startWhatsApp();
});
