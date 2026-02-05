import { ISaveSurveyResult } from '@domain/usecases'

export interface ISaveSurveyResultRepository {
    save(surveyData: ISaveSurveyResult.Params): Promise<void>
}

export namespace ISaveSurveyResultRepository {
    export type Params = ISaveSurveyResult.Params
    export type Result = void
}
