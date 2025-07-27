import { SurveyMongoRepository } from "@infrastructure/db"
import { mongoDBAdapter } from "@main/config/db-connection"
import { DbAddSurvey } from "@data/usecases"
import { IAddSurvey } from "@domain/usecases"

export const makeDbAddSurvey = (): IAddSurvey => {
    const surveyMongoRepository = new SurveyMongoRepository(mongoDBAdapter)
    return new DbAddSurvey(surveyMongoRepository)
}
