import { ISurveyResultModel } from '@domain/models'

export interface ILoadSurveyResultRepository {
    loadBySurveyId(surveyId: string): Promise<ISurveyResultModel>
}
