import { IController, IHttpResponse } from '@presentation/protocols'
import { internalServerError, noContent, success } from '@presentation/helpers'
import { ILoadSurveys } from '@domain/usecases'

export class LoadSurveysController implements IController {
    constructor(
        private readonly loadSurveys: ILoadSurveys,
    ) {}

    async handle(request: LoadSurveysController.Request): Promise<IHttpResponse> {
        try {
            const { accountId } = request
            const surveys = await this.loadSurveys.load(accountId)
            return surveys.length ? success(surveys) : noContent()
        } catch (error) {
            return internalServerError(error)
        }
    }
}

export namespace LoadSurveysController {
    export type Request = {
        accountId: string
    }
}
