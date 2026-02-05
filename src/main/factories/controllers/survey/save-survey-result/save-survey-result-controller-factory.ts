import { IController } from '@presentation/protocols'
import { SaveSurveyResultController } from '@presentation/controllers'
import { makeDbLoadAnswersBySurvey } from '@main/factories/usecases/survey/db-load-answers-by-survey-factory'
import { makeDbSaveSurveyResult } from '@main/factories/usecases/survey/db-save-survey-result-factory'

export const makeSaveSurveyResultController = (): IController => {
    return new SaveSurveyResultController(
        makeDbLoadAnswersBySurvey(),
        makeDbSaveSurveyResult(),
    )
}
