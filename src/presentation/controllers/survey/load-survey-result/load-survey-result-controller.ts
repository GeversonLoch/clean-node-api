// import { ILoadSurveyResultRepository } from '@data/protocols'
import { ILoadSurveyById, ILoadSurveyResult } from '@domain/usecases'
import { InvalidParamError } from '@presentation/errors'
import { forbidden, internalServerError, success } from '@presentation/helpers'
import { IController, IHttpRequest, IHttpResponse } from '@presentation/protocols'

export class LoadSurveyResultController implements IController {
    constructor(
        private readonly loadSurveyById: ILoadSurveyById,
        private readonly loadSurveyResult: ILoadSurveyResult,
    ) {}

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        try {
            const { accountId } = httpRequest
            const { surveyId } = httpRequest.params
            const survey = await this.loadSurveyById.loadById(surveyId)
            if (!survey) {
                return forbidden(new InvalidParamError('surveyId'))
            }
            const surveyResult = await this.loadSurveyResult.load(surveyId, accountId)
            return success(surveyResult)
        } catch (error) {
            return internalServerError(error)
        }
    }
}
