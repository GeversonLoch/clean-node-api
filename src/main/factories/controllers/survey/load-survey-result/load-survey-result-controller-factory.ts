import { IController } from '@presentation/protocols'
import { LoadSurveyResultController } from '@presentation/controllers'
import { makeDbLoadSurveyById } from '@main/factories/usecases/survey/db-load-survey-by-id-factory'
import { makeDbLoadSurveyResult } from '@main/factories/usecases/survey/db-load-survey-result-factory'

export const makeLoadSurveyResultController = (): IController => {
    return new LoadSurveyResultController(
        makeDbLoadSurveyById(),
        makeDbLoadSurveyResult(),
    )
}
