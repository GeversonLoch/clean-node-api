import { ILoadSurveyByIdRepository, ILoadSurveyResultRepository } from '@data/protocols'
import { ILoadSurveyResult } from '@domain/usecases'
import { ISurveyResultModel } from '@domain/models'

export class DbLoadSurveyResult implements ILoadSurveyResult {
    constructor(
        private readonly loadSurveyResultRepository: ILoadSurveyResultRepository,
        private readonly loadSurveyByRepository: ILoadSurveyByIdRepository,
    ) {}

    async load(surveyId: string): Promise<ISurveyResultModel> {
        let surveyResult = await this.loadSurveyResultRepository.loadBySurveyId(surveyId)
        if (!surveyResult) {
            const survey = await this.loadSurveyByRepository.loadById(surveyId)
            surveyResult = {
                surveyId: survey.id,
                question: survey.question,
                answers: survey.answers.map(answer => Object.assign({}, answer, {
                    count: 0,
                    percent: 0,
                })),
                date: survey.date,
            }
        }
        return surveyResult
    }
}
