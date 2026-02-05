import { ISurveyModel } from '@domain/models'

export interface ILoadAnswersBySurveyRepository {
    loadById(id: string): Promise<ILoadAnswersBySurveyRepository.Result>
}

export namespace ILoadAnswersBySurveyRepository {
    export type Result = ISurveyModel
}
