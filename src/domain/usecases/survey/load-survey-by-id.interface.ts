import { ISurveyModel } from '@domain/models'

export interface ILoadSurveyById {
    loadById(id: any): Promise<ISurveyModel>
}
