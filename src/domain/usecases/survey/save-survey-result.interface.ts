import { ISurveyResultModel } from '@domain/models'

export interface ISaveSurveyResult {
    save(surveyData: ISaveSurveyResult.Params): Promise<ISaveSurveyResult.Result>
}

export namespace ISaveSurveyResult {
    export type Params = {
        surveyId: string
        accountId: string
        question: string
        answer: string
        date: Date
    }
    export type Result = ISurveyResultModel
}
