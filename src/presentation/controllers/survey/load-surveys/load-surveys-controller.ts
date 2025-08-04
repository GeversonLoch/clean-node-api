import { IController, IHttpResponse } from '@presentation/protocols'
import { internalServerError, noContent, success } from '@presentation/helpers'
import { ILoadSurveys } from '@domain/usecases'

export class LoadSurveysController implements IController {
    constructor(
        private readonly loadSurveys: ILoadSurveys,
    ) {}

    async handle(): Promise<IHttpResponse> {
        try {
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
