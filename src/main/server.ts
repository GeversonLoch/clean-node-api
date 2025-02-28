/*
* Responsável por iniciar o servidor.
* Importa a configuração do app e inicia o servidor.
*/

/* Registra os aliases definidos (em package.json & tsconfig.json)
para que os caminhos personalizados (como "@main") sejam resolvidos
corretamente em tempo de execução em DEV pelo sucrase-node. */
import "module-alias/register"

import app from "@main/config/app"
import env from "@main/config/env"
import { MongoHelper } from "@infrastructure/db"

let mongoHelper = new MongoHelper(env.mongoUrl, env.dbName)

mongoHelper.connect()
.then(() => {
    app.listen(env.port, () => console.info(`Server running at http://localhost:${env.port}`))
})
.catch(console.error)
