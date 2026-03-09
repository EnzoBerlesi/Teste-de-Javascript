// Configuração central do express
// Aqui registramos middlewares globais e a rota do Swagger

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger/swagger.js';

const app = express();

// Permite receber JSON no body das requisições
app.use(express.json());

// Rota da documentação Swagger
// Acesse http://localhost:3000/api/docs para ver a documentação
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;