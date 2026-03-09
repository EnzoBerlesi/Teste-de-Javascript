// src/config/database.js
// Responsável por criar e exportar a conexão com o PostgreSQL (Neon)

import { Pool } from 'pg';

// O Pool gerencia múltiplas conexões simultâneas com o banco
// Muito melhor que abrir/fechar uma conexão a cada requisição
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // necessário pro Neon funcionar
    }
});

// Testa a conexão ao iniciar
pool.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
    } else {
        console.log('Conectado ao PostgreSQL (Neon) com sucesso!');
    }
});

export default pool;