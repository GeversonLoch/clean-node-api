import { SurveyMongoRepository, SurveyResultMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { DbLoadSurveyResult } from '@data/usecases'
import { ILoadSurveyResult } from '@domain/usecases'

export const makeDbLoadSurveyResult = (): ILoadSurveyResult => {
    const surveyResultMongoRepository = new SurveyResultMongoRepository(mongoDBAdapter)
    const surveyMongoRepository = new SurveyMongoRepository(mongoDBAdapter)
    return new DbLoadSurveyResult(surveyResultMongoRepository, surveyMongoRepository)
}
