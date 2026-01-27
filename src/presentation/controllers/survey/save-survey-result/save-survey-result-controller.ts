import { ILoadSurveyById, ISaveSurveyResult } from '@domain/usecases'
import { InvalidParamError } from '@presentation/errors'
import { forbidden, internalServerError, success } from '@presentation/helpers'
import { IController, IHttpRequest, IHttpResponse } from '@presentation/protocols'

export class SaveSurveyResultController implements IController {
    constructor(
        private readonly loadSurveyById: ILoadSurveyById,
        private readonly saveSurveyResult: ISaveSurveyResult,
    ) {}

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        try {
            const { accountId } = httpRequest
            const { surveyId } = httpRequest.params
            const { question } = httpRequest.body
            const { answer } = httpRequest.body
            const survey = await this.loadSurveyById.loadById(surveyId)
            if (survey) {
                const answers = survey.answers.map(a => a.answer)
                if (!answers.includes(answer)) {
                    return forbidden(new InvalidParamError('answer'))
                }
            } else {
                return forbidden(new InvalidParamError('surveyId'))
            }
            const surveyResult = await this.saveSurveyResult.save({
                accountId,
                surveyId,
                question,
                answer,
                date: new Date(),
            })
            return success(surveyResult)
        } catch (error) {
            return internalServerError(error)
        }
    }
}
