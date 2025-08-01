import { IController, IHttpRequest, IHttpResponse } from '@presentation/protocols'
import { badRequest, internalServerError, success } from '@presentation/helpers'
import { IValidation } from '@presentation/protocols'
import { ISurveyModel } from '@domain/models'
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

            const surveys: Array<ISurveyModel> = await this.loadSurveys.load()

            return success(surveys)
        } catch (error) {
            return internalServerError(error)
        }
    }
}
