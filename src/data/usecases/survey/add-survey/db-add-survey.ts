import { IAddSurveyRepository } from '@data/protocols'
import { IAddSurveyParams } from '@domain/usecases'
import { IAddSurvey } from '@domain/usecases'

export class DbAddSurvey implements IAddSurvey {
    constructor(
        private readonly addSurveyRepository: IAddSurveyRepository,
    ) {}

    async add(surveyData: IAddSurveyParams): Promise<void> {
        await this.addSurveyRepository.add(surveyData)
    }
}
