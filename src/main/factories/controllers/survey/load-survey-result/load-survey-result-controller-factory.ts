import { IController } from '@presentation/protocols'
import { LoadSurveyResultController } from '@presentation/controllers'
import { makeDbCheckSurveyById } from '@main/factories/usecases/survey/db-check-survey-by-id-factory'
import { makeDbLoadSurveyResult } from '@main/factories/usecases/survey/db-load-survey-result-factory'

export const makeLoadSurveyResultController = (): IController => {
    return new LoadSurveyResultController(
        makeDbCheckSurveyById(),
        makeDbLoadSurveyResult(),
    )
}
