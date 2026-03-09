// Rotas sem parâmetro de ID
// POST /api/order  → criar pedido
// GET  /api/order  → listar todos os pedidos

import pool from '../../../src/config/database.js';
import { authMiddleware } from '../../../src/middlewares/authMiddleware.js';

/**
 * @swagger
 * /api/order:
 *   post:
 *     summary: Criar um novo pedido
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numeroPedido:
 *                 type: string
 *                 example: v10089015vdb-01
 *               valorTotal:
 *                 type: number
 *                 example: 10000
 *               dataCriacao:
 *                 type: string
 *                 example: 2023-07-19T12:24:11.529Z
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idItem:
 *                       type: string
 *                     quantidadeItem:
 *                       type: number
 *                     valorItem:
 *                       type: number
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Não autorizado
 * 
 *   get:
 *     summary: Listar todos os pedidos
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pedidos
 *       401:
 *         description: Não autorizado
 */

export default function handler(req, res) {
    // Valida o token JWT antes de qualquer coisa
    return authMiddleware(req, res, () => {
        if (req.method === 'POST') return criarPedido(req, res);
        if (req.method === 'GET') return listarPedidos(req, res);
        return res.status(405).json({ error: 'Método não permitido.' });
    });
}

async function criarPedido(req, res) {
    const { numeroPedido, valorTotal, dataCriacao, items } = req.body;

    if (!numeroPedido || !valorTotal || !dataCriacao || !items) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Mapping dos campos conforme exigido no desafio
        // numeroPedido → orderId, valorTotal → value, dataCriacao → creationDate
        const orderMapped = {
            orderId: numeroPedido,
            value: valorTotal,
            creationDate: new Date(dataCriacao),
            items: items.map(item => ({
                productId: parseInt(item.idItem),
                quantity: item.quantidadeItem,
                price: item.valorItem,
            })),
        };

        // Inicia uma transaction — ou salva tudo ou não salva nada
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insere o pedido
            await client.query(
                `INSERT INTO orders ("orderId", value, "creationDate") VALUES ($1, $2, $3)`,
                [orderMapped.orderId, orderMapped.value, orderMapped.creationDate]
            );

            // Insere cada item do pedido
            for (const item of orderMapped.items) {
                await client.query(
                    `INSERT INTO items ("orderId", "productId", quantity, price) VALUES ($1, $2, $3, $4)`,
                    [orderMapped.orderId, item.productId, item.quantity, item.price]
                );
            }

            await client.query('COMMIT');
            return res.status(201).json({ message: 'Pedido criado com sucesso!', order: orderMapped });

        } catch (err) {
            await client.query('ROLLBACK'); // desfaz tudo se der erro
            throw err;
        } finally {
            client.release(); // devolve a conexão pro pool
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao criar pedido.', details: err.message });
    }
}

async function listarPedidos(req, res) {
    try {
        // Busca pedidos e seus itens com JOIN
        const result = await pool.query(`
      SELECT 
        o."orderId", o.value, o."creationDate",
        i."productId", i.quantity, i.price
      FROM orders o
      LEFT JOIN items i ON o."orderId" = i."orderId"
      ORDER BY o."creationDate" DESC
    `);

        // Agrupa os itens dentro de cada pedido
        const ordersMap = {};
        for (const row of result.rows) {
            if (!ordersMap[row.orderId]) {
                ordersMap[row.orderId] = {
                    orderId: row.orderId,
                    value: row.value,
                    creationDate: row.creationDate,
                    items: [],
                };
            }
            if (row.productId) {
                ordersMap[row.orderId].items.push({
                    productId: row.productId,
                    quantity: row.quantity,
                    price: row.price,
                });
            }
        }

        return res.status(200).json(Object.values(ordersMap));

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao listar pedidos.', details: err.message });
    }
}