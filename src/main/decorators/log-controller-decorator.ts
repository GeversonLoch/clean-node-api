/*
* Decorador responsável por adicionar a 
* funcionalidade de log de erros ao controlador original.
*/

import { IController, IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { ILogErrorRepository } from "@data/protocols"

export class LogControllerDecorator implements IController {
    private readonly controller: IController
    private readonly logErrorRepository: ILogErrorRepository

    constructor(controller: IController, logErrorRepository: ILogErrorRepository) {
        this.controller = controller
        this.logErrorRepository = logErrorRepository
    }

    // Método que trata a requisição e, caso ocorra um erro interno, registra o log do erro.
    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const httpResponse = await this.controller.handle(httpRequest)
        if (httpResponse.statusCode === 500) {
            await this.logErrorRepository.logError(httpResponse.body.stack)
        }
        return httpResponse
    }
}
