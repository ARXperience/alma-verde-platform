const express = require('express');
const { parse } = require('url');
const next = require('next');
const { initWhatsAppBot } = require('./src/lib/whatsapp/index.js');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// inicializa la aplicación Next.js
const nextApp = next({ dev, hostname, port });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  const server = express();

  // Inicializar y montar las rutas del Bot de WhatsApp en /api/whatsapp
  console.log('🔄 Inicializando bot de WhatsApp...');
  initWhatsAppBot(server);

  // Manejar todas las demás peticiones con Next.js
  server.all('*', async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
