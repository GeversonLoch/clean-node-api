import { IController } from '@presentation/protocols'
import { LoadSurveysController } from '@presentation/controllers'
import { makeDbLoadSurveys } from '@main/factories/usecases/survey/db-load-surveys-factory'

export const makeLoadSurveysController = (): IController => {
    return new LoadSurveysController(
        makeDbLoadSurveys()
    )
}
