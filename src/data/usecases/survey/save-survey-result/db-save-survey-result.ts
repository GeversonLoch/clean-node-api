import { ILoadSurveyResultRepository, ISaveSurveyResultRepository } from '@data/protocols'
import { ISaveSurveyResult } from '@domain/usecases'

export class DbSaveSurveyResult implements ISaveSurveyResult {
    constructor(
        private readonly saveSurveyResultRepository: ISaveSurveyResultRepository,
        private readonly loadSurveyResultRepository: ILoadSurveyResultRepository,
    ) {}

    async save(surveyData: ISaveSurveyResult.Params): Promise<ISaveSurveyResult.Result> {
        await this.saveSurveyResultRepository.save(surveyData)
        const surveyResult = await this.loadSurveyResultRepository.loadBySurveyId(surveyData.surveyId, surveyData.accountId)
        return surveyResult
    }
}
