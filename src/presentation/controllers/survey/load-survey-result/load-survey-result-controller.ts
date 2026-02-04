// import { ILoadSurveyResultRepository } from '@data/protocols'
import { ILoadSurveyById, ILoadSurveyResult } from '@domain/usecases'
import { InvalidParamError } from '@presentation/errors'
import { forbidden, internalServerError, success } from '@presentation/helpers'
import { IController, IHttpResponse } from '@presentation/protocols'

export class LoadSurveyResultController implements IController {
    constructor(
        private readonly loadSurveyById: ILoadSurveyById,
        private readonly loadSurveyResult: ILoadSurveyResult,
    ) {}

    async handle(request: LoadSurveyResultController.Request): Promise<IHttpResponse> {
        try {
            const { accountId, surveyId } = request
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

export namespace LoadSurveyResultController {
  export type Request = {
    accountId: string
    surveyId: string
  }
}
