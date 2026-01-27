import { SurveyResultMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { DbSaveSurveyResult } from '@data/usecases'
import { ISaveSurveyResult } from '@domain/usecases'

export const makeDbSaveSurveyResult = (): ISaveSurveyResult => {
    const surveyResultMongoRepository = new SurveyResultMongoRepository(mongoDBAdapter)
    return new DbSaveSurveyResult(surveyResultMongoRepository)
}
