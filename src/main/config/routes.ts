/**
* Arquivo responsável por centralizar o carregamento dinâmico das rotas da aplicação.
* Utiliza o fast-glob para localizar e importar automaticamente todos os arquivos de rotas.
*/
import { Express, Router } from "express"
import fg from "fast-glob" // Importa o fast-glob para realizar buscas de arquivos de forma eficiente

export default (app: Express): void => {
    const router = Router()
    app.use('/api', router) // Registra o router com o prefixo '/api', agrupando todas as rotas da API

    // Procura por todos os arquivos que terminam com "routes.ts" dentro de "src/main/routes"
    fg.sync('**/src/main/routes/**routes.ts').map(async file => {
        // Importa cada arquivo de rota encontrado e executa sua função padrão, passando o router
        (await import(`../../../${file}`)).default(router)
    })
}
