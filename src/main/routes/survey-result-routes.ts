import { Router } from 'express'
import { auth } from '@main/middlewares/auth'
import { expressRouteAdapter } from '@main/adapters/express/express-route-adapter'
import { makeSaveSurveyResultController } from '@main/factories/controllers/survey/save-survey-result/save-survey-result-controller-factory'
import { makeLoadSurveyResultController } from '@main/factories/controllers/survey/load-survey-result/load-survey-result-controller-factory'

export default (router: Router): void => {
    router.put('/surveys/:surveyId/results', auth, expressRouteAdapter(makeSaveSurveyResultController()))
    router.get('/surveys/:surveyId/results', auth, expressRouteAdapter(makeLoadSurveyResultController()))
}
