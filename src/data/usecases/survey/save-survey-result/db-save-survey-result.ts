import { ILoadSurveyResultRepository, ISaveSurveyResultRepository } from '@data/protocols'
import { ISaveSurveyResult, ISaveSurveyResultParams } from '@domain/usecases'
import { ISurveyResultModel } from '@domain/models'

export class DbSaveSurveyResult implements ISaveSurveyResult {
    constructor(
        private readonly saveSurveyResultRepository: ISaveSurveyResultRepository,
        private readonly loadSurveyResultRepository: ILoadSurveyResultRepository,
    ) {}

    async save(surveyData: ISaveSurveyResultParams): Promise<ISurveyResultModel> {
        await this.saveSurveyResultRepository.save(surveyData)
        const surveyResult = await this.loadSurveyResultRepository.loadBySurveyId(surveyData.surveyId, surveyData.accountId)
        return surveyResult
    }
}
