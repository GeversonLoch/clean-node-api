import { ISurveyModel } from '@domain/models'

export interface ILoadSurveys {
    load(accountId: string): Promise<ISurveyModel[]>
}
