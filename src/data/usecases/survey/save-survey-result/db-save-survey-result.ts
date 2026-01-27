import { ISaveSurveyResultRepository } from '@data/protocols'
import { ISaveSurveyResult, ISaveSurveyResultParams } from '@domain/usecases'
import { ISurveyResultModel } from '@domain/models'

export class DbSaveSurveyResult implements ISaveSurveyResult {
    constructor(
        private readonly saveSurveyResultRepository: ISaveSurveyResultRepository,
    ) {}

    async save(surveyData: ISaveSurveyResultParams): Promise<ISurveyResultModel> {
        const surveyResult = await this.saveSurveyResultRepository.save(surveyData)
        return surveyResult
    }
}
