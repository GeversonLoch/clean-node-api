import { ILoadSurveysRepository } from '@data/protocols'
import { ISurveyModel } from '@domain/models'
import { ILoadSurveys } from '@domain/usecases'

export class DbLoadSurveys implements ILoadSurveys {
    constructor(
        private readonly loadSurveysRepository: ILoadSurveysRepository,
    ) {}

    async load(): Promise<ISurveyModel[]> {
        const surveys = await this.loadSurveysRepository.loadAll()
        return surveys
    }
}
