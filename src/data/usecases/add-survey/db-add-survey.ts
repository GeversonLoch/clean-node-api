import { IAddSurveyRepository } from '@data/protocols'
import { IAddSurveyModel } from '@domain/models'
import { IAddSurvey } from '@domain/usecases'

export class DbAddSurvey implements IAddSurvey {
    constructor(
        private readonly addSurveyRepository: IAddSurveyRepository,
    ) {}

    async add(surveyData: IAddSurveyModel): Promise<void> {
        await this.addSurveyRepository.add(surveyData)
    }
}
