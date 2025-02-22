/*
* Configura o aplicativo Express.
* Importa o Express e os middlewares, aplicando-os ao app.
* Exporta o app configurado para ser utilizado por outros módulos (ex.: server e testes).
*/
import express from "express"
import setupMiddlewares from "@main/config/middlewares"

// Cria uma instância do app Express
const app = express()

// Configura os middlewares definidos no arquivo middlewares.ts
setupMiddlewares(app)

export default app
