// Responsável por gerar e renovar tokens automaticamente
// O cliente faz login uma vez e o token é renovado a cada requisição

import jwt from 'jsonwebtoken';

export function refreshToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) return next();

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Se o token expira em menos de 1 hora, gera um novo
        const agora = Math.floor(Date.now() / 1000);
        const tempoRestante = decoded.exp - agora;

        if (tempoRestante < 3600) {
            const novoToken = jwt.sign(
                { username: decoded.username },
                process.env.JWT_SECRET,
                { expiresIn: '8h' }
            );
            // Manda o novo token no header de resposta
            res.setHeader('x-new-token', novoToken);
        }

        next();
    } catch {
        next();
    }
}