import { SurveyMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { DbLoadAnswersBySurvey } from '@data/usecases'
import { ILoadAnswersBySurvey } from '@domain/usecases'

export const makeDbLoadAnswersBySurvey = (): ILoadAnswersBySurvey => {
    const surveyMongoRepository = new SurveyMongoRepository(mongoDBAdapter)
    return new DbLoadAnswersBySurvey(surveyMongoRepository)
}
