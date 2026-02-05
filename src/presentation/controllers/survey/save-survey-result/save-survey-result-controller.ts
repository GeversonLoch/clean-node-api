import { ILoadAnswersBySurvey, ISaveSurveyResult } from '@domain/usecases'
import { InvalidParamError } from '@presentation/errors'
import { forbidden, internalServerError, success } from '@presentation/helpers'
import { IController, IHttpResponse } from '@presentation/protocols'

export class SaveSurveyResultController implements IController {
    constructor(
        private readonly loadAnswersBySurvey: ILoadAnswersBySurvey,
        private readonly saveSurveyResult: ISaveSurveyResult,
    ) {}

    async handle(request: SaveSurveyResultController.Request): Promise<IHttpResponse> {
        try {
            const { accountId, surveyId, question, answer } = request
            const answers = await this.loadAnswersBySurvey.loadAnswers(surveyId)
            if (!answers.length) {
                return forbidden(new InvalidParamError('surveyId'))
            } else if (!answers.includes(answer)) {
                return forbidden(new InvalidParamError('answer'))
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

export namespace SaveSurveyResultController {
    export type Request = {
        accountId: string
        surveyId: string
        question: string
        answer: string
    }
}
