import { ISurveyModel } from '@domain/models'

export interface ILoadSurveys {
    load(): Promise<ISurveyModel[]>
}
