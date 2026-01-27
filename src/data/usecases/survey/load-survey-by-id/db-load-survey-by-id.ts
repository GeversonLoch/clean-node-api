import { ISurveyModel } from '@domain/models'
import { ILoadSurveyById } from '@domain/usecases'
import { ILoadSurveyByIdRepository } from '@data/protocols'

export class DbLoadSurveyById implements ILoadSurveyById {
    constructor(
        private readonly loadSurveyByIdRepository: ILoadSurveyByIdRepository,
    ) {}

    async loadById(id: string): Promise<ISurveyModel> {
        const survey = await this.loadSurveyByIdRepository.loadById(id)
        return survey
    }
}
