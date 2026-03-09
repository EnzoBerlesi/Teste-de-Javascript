// Rotas com parâmetro de ID
// GET    /api/order/:id → buscar pedido
// PUT    /api/order/:id → atualizar pedido
// DELETE /api/order/:id → deletar pedido

import pool from '../../../src/config/database.js';
import { authMiddleware } from '../../../src/middlewares/authMiddleware.js';

/**
 * @swagger
 * /api/order/{id}:
 *   get:
 *     summary: Buscar pedido por ID
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: v10089015vdb-01
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido não encontrado
 * 
 *   put:
 *     summary: Atualizar pedido por ID
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               valorTotal:
 *                 type: number
 *               items:
 *                 type: array
 *     responses:
 *       200:
 *         description: Pedido atualizado
 *       404:
 *         description: Pedido não encontrado
 * 
 *   delete:
 *     summary: Deletar pedido por ID
 *     tags: [Order]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido deletado
 *       404:
 *         description: Pedido não encontrado
 */

export default function handler(req, res) {
    return authMiddleware(req, res, () => {
        if (req.method === 'GET') return buscarPedido(req, res);
        if (req.method === 'PUT') return atualizarPedido(req, res);
        if (req.method === 'DELETE') return deletarPedido(req, res);
        return res.status(405).json({ error: 'Método não permitido.' });
    });
}

async function buscarPedido(req, res) {
    const { id } = req.query;

    try {
        const result = await pool.query(`
      SELECT 
        o."orderId", o.value, o."creationDate",
        i."productId", i.quantity, i.price
      FROM orders o
      LEFT JOIN items i ON o."orderId" = i."orderId"
      WHERE o."orderId" = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        // Monta o objeto do pedido com os itens
        const order = {
            orderId: result.rows[0].orderId,
            value: result.rows[0].value,
            creationDate: result.rows[0].creationDate,
            items: result.rows
                .filter(row => row.productId)
                .map(row => ({
                    productId: row.productId,
                    quantity: row.quantity,
                    price: row.price,
                })),
        };

        return res.status(200).json(order);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao buscar pedido.', details: err.message });
    }
}

async function atualizarPedido(req, res) {
    const { id } = req.query;
    const { valorTotal, items } = req.body;

    try {
        // Verifica se o pedido existe
        const exists = await pool.query(`SELECT "orderId" FROM orders WHERE "orderId" = $1`, [id]);
        if (exists.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Atualiza o valor do pedido se fornecido
            if (valorTotal) {
                await client.query(
                    `UPDATE orders SET value = $1 WHERE "orderId" = $2`,
                    [valorTotal, id]
                );
            }

            // Se novos itens foram enviados, deleta os antigos e insere os novos
            if (items && items.length > 0) {
                await client.query(`DELETE FROM items WHERE "orderId" = $1`, [id]);

                for (const item of items) {
                    await client.query(
                        `INSERT INTO items ("orderId", "productId", quantity, price) VALUES ($1, $2, $3, $4)`,
                        [id, parseInt(item.idItem), item.quantidadeItem, item.valorItem]
                    );
                }
            }

            await client.query('COMMIT');
            return res.status(200).json({ message: 'Pedido atualizado com sucesso!' });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao atualizar pedido.', details: err.message });
    }
}

async function deletarPedido(req, res) {
    const { id } = req.query;

    try {
        // O ON DELETE CASCADE já deleta os itens automaticamente
        const result = await pool.query(
            `DELETE FROM orders WHERE "orderId" = $1 RETURNING "orderId"`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        return res.status(200).json({ message: 'Pedido deletado com sucesso!' });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Erro ao deletar pedido.', details: err.message });
    }
}