/*
 * Exporta o middleware contentTypeJson, que define o cabeçalho "Content-Type" da resposta como "application/json".
 */
import { Request, Response, NextFunction } from "express"

// Cria e exporta o middleware que configura a resposta para o tipo JSON
export const contentTypeJson = (req: Request, res: Response, next: NextFunction) => {
    res.type('json')
    next()
}
