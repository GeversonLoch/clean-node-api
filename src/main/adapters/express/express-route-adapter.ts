import { makeLogControllerDecorator } from '@main/factories/decorators/log-controller-factory'
import { IController, IHttpRequest } from '@presentation/protocols'
import { Request, Response } from 'express'

export const expressRouteAdapter = (controller: IController) => {
    return async (req: Request, res: Response) => {
        const httpRequest: IHttpRequest = {
            body: req.body
        }

        const logControllerDecorator = makeLogControllerDecorator(controller)
        const httpResponse = await logControllerDecorator.handle(httpRequest)

        if (httpResponse.statusCode >= 400) {
            const errorMessage =
                httpResponse.body instanceof Error
                    ? httpResponse.body.message
                    : httpResponse.body
            res.status(httpResponse.statusCode).json({ error: errorMessage })
        } else {
            res.status(httpResponse.statusCode).json(httpResponse.body)
        }
    }
}
