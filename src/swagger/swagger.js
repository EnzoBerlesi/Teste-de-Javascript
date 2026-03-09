// Configuração da documentação automática da API
// Acesse em: http://localhost:3000/api/docs

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Order API',
            version: '1.0.0',
            description: 'API de gerenciamento de pedidos - Jitterbit',
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Servidor local',
            },
        ],
        // Configuração para autenticação JWT no Swagger
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    // Onde o swagger vai procurar os comentários de documentação
    apis: ['./pages/api/**/*.js'],
};

export const swaggerSpec = swaggerJsdoc(options);