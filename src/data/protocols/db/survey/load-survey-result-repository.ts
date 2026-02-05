import { ILoadSurveyResult } from "@domain/usecases"

export interface ILoadSurveyResultRepository {
    loadBySurveyId(surveyId: string, accountId: string): Promise<ILoadSurveyResultRepository.Result>
}

export namespace ILoadSurveyResultRepository {
    export type Result = ILoadSurveyResult.Result
}
