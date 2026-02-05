import { ILoadSurveysRepository } from '@data/protocols'
import { ILoadSurveys } from '@domain/usecases'

export class DbLoadSurveys implements ILoadSurveys {
    constructor(
        private readonly loadSurveysRepository: ILoadSurveysRepository,
    ) {}

    async load(accountId: string): Promise<ILoadSurveys.Result> {
        const surveys = await this.loadSurveysRepository.loadAll(accountId)
        return surveys
    }
}
