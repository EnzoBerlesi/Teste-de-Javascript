import jwt from 'jsonwebtoken';

export function authMiddleware(req, res, next) {
    // Tenta pegar o token do header Authorization
    const authHeader = req.headers['authorization'];
    let token = authHeader?.split(' ')[1];

    // Se não veio no header, tenta pegar do cookie
    if (!token && req.headers.cookie) {
        const cookies = Object.fromEntries(
            req.headers.cookie.split('; ').map(c => c.split('='))
        );
        token = cookies['token'];
    }

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }
}