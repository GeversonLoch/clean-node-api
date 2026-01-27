import { ISurveyModel } from '@domain/models'

export interface ILoadSurveyByIdRepository {
    loadById(id: string): Promise<ISurveyModel>
}
