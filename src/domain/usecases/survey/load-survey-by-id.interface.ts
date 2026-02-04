import { ISurveyModel } from '@domain/models'

export interface ILoadSurveyById {
    loadById(id: any): Promise<ILoadSurveyById.Result>
}

export namespace ILoadSurveyById {
    export type Result = ISurveyModel
}
