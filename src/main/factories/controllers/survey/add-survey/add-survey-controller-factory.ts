import { IController } from '@presentation/protocols'
import { AddSurveyController } from '@presentation/controllers'
import { makeDbAddSurvey } from '@main/factories/usecases/database/db-add-survey-factory'
import { makeAddSurveyValidation } from './add-survey-validation-factory'

export const makeAddSurveyController = (): IController => {
    return new AddSurveyController(
        makeAddSurveyValidation(),
        makeDbAddSurvey()
    )
}
