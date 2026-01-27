import { SurveyMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { DbLoadSurveyById } from '@data/usecases'
import { ILoadSurveyById } from '@domain/usecases'

export const makeDbLoadSurveyById = (): ILoadSurveyById => {
    const surveyMongoRepository = new SurveyMongoRepository(mongoDBAdapter)
    return new DbLoadSurveyById(surveyMongoRepository)
}
