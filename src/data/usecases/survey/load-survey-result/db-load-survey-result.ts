import { ILoadSurveyByIdRepository, ILoadSurveyResultRepository } from '@data/protocols'
import { ILoadSurveyResult } from '@domain/usecases'
import { ISurveyResultModel } from '@domain/models'

export class DbLoadSurveyResult implements ILoadSurveyResult {
    constructor(
        private readonly loadSurveyResultRepository: ILoadSurveyResultRepository,
        private readonly loadSurveyByRepository: ILoadSurveyByIdRepository,
    ) {}

    async load(surveyId: string, accountId: string): Promise<ISurveyResultModel> {
        let surveyResult = await this.loadSurveyResultRepository.loadBySurveyId(surveyId, accountId)
        if (!surveyResult) {
            const survey = await this.loadSurveyByRepository.loadById(surveyId)
            surveyResult = {
                surveyId: survey.id,
                question: survey.question,
                answers: survey.answers.map(answer => Object.assign({}, answer, {
                    count: 0,
                    percent: 0,
                    isCurrentAccountAnswer: false,
                })),
                date: survey.date,
            }
        }
        return surveyResult
    }
}
