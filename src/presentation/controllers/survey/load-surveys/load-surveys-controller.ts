import { IController, IHttpRequest, IHttpResponse } from '@presentation/protocols'
import { badRequest, internalServerError, noContent, success } from '@presentation/helpers'
import { IValidation } from '@presentation/protocols'
import { ILoadSurveys } from '@domain/usecases'

export class LoadSurveysController implements IController {
    constructor(
        private readonly validation: IValidation,
        private readonly loadSurveys: ILoadSurveys,
    ) {}

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        try {
            // TODO: Verificar se 'validation' é nescessario futuramente e se não quebra a request sem o body!
            const error = this.validation.validate(httpRequest.body)
            if (error) {
                return badRequest(error)
            }

            const surveys = await this.loadSurveys.load()
            if (surveys.length)
                return success(surveys)
            else
                return noContent()
        } catch (error) {
            return internalServerError(error)
        }
    }
}
