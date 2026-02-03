import { ISurveyResultModel } from '@domain/models'

export interface ILoadSurveyResult {
    load(surveyId: string, accountId: string): Promise<ISurveyResultModel>
}
