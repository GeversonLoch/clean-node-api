import { ISaveSurveyResultRepository } from '@data/protocols'
import { ISaveSurveyResult, ISaveSurveyResultModel } from '@domain/usecases'
import { ISurveyResultModel } from '@domain/models'

export class DbSaveSurveyResult implements ISaveSurveyResult {
    constructor(
        private readonly saveSurveyResultRepository: ISaveSurveyResultRepository,
    ) {}

    async save(surveyData: ISaveSurveyResultModel): Promise<ISurveyResultModel> {
        const surveyResult = await this.saveSurveyResultRepository.save(surveyData)
        return surveyResult
    }
}
