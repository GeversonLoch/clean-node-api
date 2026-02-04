/*
* Decorador responsável por adicionar a 
* funcionalidade de log de erros ao controlador original.
*/

import { IController, IHttpResponse } from "@presentation/protocols"
import { ILogErrorRepository } from "@data/protocols"

export class LogControllerDecorator implements IController {
    constructor(
        private readonly controller: IController,
        private readonly logErrorRepository: ILogErrorRepository
    ) {}

    // Método que trata a requisição e, caso ocorra um erro interno, registra o log do erro.
    async handle(request: any): Promise<IHttpResponse> {
        const httpResponse = await this.controller.handle(request)
        if (httpResponse.statusCode === 500) {
            await this.logErrorRepository.logError(httpResponse.body.stack)
        }
        return httpResponse
    }
}
