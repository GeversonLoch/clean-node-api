/*
* Exporta o middleware CORS, que utiliza o método set do objeto de resposta do Express
* para definir os seguintes cabeçalhos relacionados ao CORS:
* - 'access-control-allow-origin': permite acesso de qualquer origem ('*').
* - 'access-control-allow-methods': permite todos os métodos HTTP ('*').
* - 'access-control-allow-headers': permite todos os cabeçalhos na requisição ('*').
*
* Este middleware habilita o CORS na aplicação, permitindo que recursos sejam acessados
* a partir de qualquer domínio, sem restrições de métodos ou cabeçalhos.
*/
import { Request, Response, NextFunction } from "express"

// Cria e exporta o middleware para configurar os cabeçalhos CORS
export const cors = (req: Request, res: Response, next: NextFunction) => {
    res.set('access-control-allow-origin', '*')
    res.set('access-control-allow-methods', '*')
    res.set('access-control-allow-headers', '*')
    next()
}
