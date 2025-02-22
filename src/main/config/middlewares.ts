/*
* Responsável por aplicar os middlewares essenciais ao app Express.
* • Importa e utiliza o middleware bodyParser para analisar o corpo das requisições.
* • Importa e utiliza o middleware cors para configurar os cabeçalhos CORS, permitindo acesso de qualquer origem,
*   bem como liberando métodos HTTP e cabeçalhos específicos.
*/
import { Express } from "express"
import { bodyParser, cors } from "@main/middlewares"

export default (app: Express): void => {
    app.use(bodyParser)
    app.use(cors)
}
