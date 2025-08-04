import { SurveyMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { DbLoadSurveys } from '@data/usecases'
import { ILoadSurveys } from '@domain/usecases'

export const makeDbLoadSurveys = (): ILoadSurveys => {
    const surveyMongoRepository = new SurveyMongoRepository(mongoDBAdapter)
    return new DbLoadSurveys(surveyMongoRepository)
}
