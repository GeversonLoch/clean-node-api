import { ISurveyResultModel } from '@domain/models'

export type ISaveSurveyResultParams = {
    surveyId: string
    accountId: string
    question: string
    answer: string
    date: Date
}

export interface ISaveSurveyResult {
    save(surveyData: ISaveSurveyResultParams): Promise<ISurveyResultModel>
}
