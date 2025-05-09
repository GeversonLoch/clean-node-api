/**
* Arquivo responsável por centralizar o carregamento dinâmico das rotas da aplicação.
* Utiliza o fast-glob para localizar e importar automaticamente todos os arquivos de rotas.
*/
import { Express, Router } from 'express'
import fg from 'fast-glob'
import { resolve } from 'path'

export default (app: Express): void => {
    const router = Router()

    // Registra o router com o prefixo '/api', agrupando todas as rotas da API
    app.use('/api', router)

    const path = resolve(__dirname, '../routes/')
    const source = fg.convertPathToPattern(path)

    fg.sync(`${source}/**routes.{js,ts}`, { absolute: true }).map(async file => {
        (await import(file)).default(router)
    })
}
