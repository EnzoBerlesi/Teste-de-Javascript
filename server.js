// server.js
// Inicializa o Next.js junto com o Express

import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import app from './src/app.js';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev });
const handle = nextApp.getRequestHandler();

const PORT = process.env.PORT || 3000;

nextApp.prepare().then(() => {
    createServer((req, res) => {
        const parsedUrl = parse(req.url, true);
        const { pathname } = parsedUrl;

        // Rotas do Swagger ficam no Express
        if (pathname.startsWith('/api/docs')) {
            return app(req, res);
        }

        // Todo o resto (incluindo /api/order, /api/auth) vai pro Next.js
        handle(req, res, parsedUrl);

    }).listen(PORT, () => {
        console.log(`Servidor rodando em: http://localhost:${PORT}`);
        console.log(`Swagger disponível em: http://localhost:${PORT}/api/docs`);
    });
});