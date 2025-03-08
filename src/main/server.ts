/*
* Responsável por iniciar o servidor.
* Importa a configuração do app e inicia o servidor.
*/

/* Registra os aliases definidos (em package.json & tsconfig.json)
para que os caminhos personalizados (como "@main") sejam resolvidos
corretamente em tempo de execução em DEV pelo sucrase-node. */
import "module-alias/register"
import "@main/config/env-config"
import app from "@main/config/app"
import { mongoDBAdapter } from "@main/config/db-connection"

mongoDBAdapter.connect()
.then(() => {
    app.listen(process.env.PORT, () => console.info(`Server running at http://localhost:${process.env.PORT}`))
})
.catch(console.error)
