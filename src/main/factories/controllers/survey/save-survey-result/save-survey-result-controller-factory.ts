import { IController } from '@presentation/protocols'
import { SaveSurveyResultController } from '@presentation/controllers'
import { makeDbSaveSurveyResult } from '@main/factories/usecases/survey/db-save-survey-result-factory'
import { makeDbLoadSurveyById } from '@main/factories/usecases/survey/db-load-survey-by-id-factory'

export const makeSaveSurveyResultController = (): IController => {
    return new SaveSurveyResultController(
        makeDbLoadSurveyById(),
        makeDbSaveSurveyResult(),
    )
}
