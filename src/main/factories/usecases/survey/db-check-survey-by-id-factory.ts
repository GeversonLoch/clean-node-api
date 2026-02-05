import { SurveyMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { DbCheckSurveyById } from '@data/usecases'
import { ICheckSurveyById } from '@domain/usecases'

export const makeDbCheckSurveyById = (): ICheckSurveyById => {
    const surveyMongoRepository = new SurveyMongoRepository(mongoDBAdapter)
    return new DbCheckSurveyById(surveyMongoRepository)
}
