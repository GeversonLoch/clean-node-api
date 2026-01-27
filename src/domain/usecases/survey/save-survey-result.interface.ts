import { ISurveyResultModel } from '@domain/models'

export type ISaveSurveyResultModel = Omit<ISurveyResultModel, 'id'>

export interface ISaveSurveyResult {
    save(surveyData: ISaveSurveyResultModel): Promise<ISurveyResultModel>
}
