import { ISurveyResultModel } from '@domain/models'

export type ISaveSurveyResultParams = Omit<ISurveyResultModel, 'id'>

export interface ISaveSurveyResult {
    save(surveyData: ISaveSurveyResultParams): Promise<ISurveyResultModel>
}
