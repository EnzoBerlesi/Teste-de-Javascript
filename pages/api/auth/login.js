// Rota de autenticação
// POST /api/auth/login
// Recebe usuário e senha, retorna token JWT

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Autenticar usuário e obter token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Token gerado com sucesso
 *       401:
 *         description: Credenciais inválidas
 */

// Usuário fixo já que não temos tabela de usuários
// Em produção real, buscaria do banco de dados
const MOCK_USER = {
    username: 'admin',
    // senha: admin123 (já criptografada com bcrypt)
    password: bcrypt.hashSync('admin123', 10),
};

export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username e password são obrigatórios.' });
    }

    // Verifica se o usuário existe
    if (username !== MOCK_USER.username) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Compara a senha enviada com a senha criptografada
    const senhaCorreta = bcrypt.compareSync(password, MOCK_USER.password);
    if (!senhaCorreta) {
        return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    // Gera o token JWT com expiração de 8 horas
    const token = jwt.sign(
        { username: MOCK_USER.username },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    // substitui o return res.status(200).json({ token }); por isso:
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=${8 * 60 * 60}`);
    return res.status(200).json({ token });
}