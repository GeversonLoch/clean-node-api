/*
* Responsável por aplicar os middlewares(camada intermediária) essenciais ao app Express.
* • Importa e utiliza o middleware bodyParser para analisar o body das requisições.
*/
import { Express } from "express"
import { bodyParser } from "@main/middlewares/body-parser"

export default (app: Express): void => {
    // Aplica o middleware que converte os dados do body da requisição em JSON
    app.use(bodyParser)
}
