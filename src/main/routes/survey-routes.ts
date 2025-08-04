import { Router } from 'express'
import { expressRouteAdapter } from '@main/adapters/express/express-route-adapter'
import { auth, adminAuth } from '@main/middlewares/auth'
import { makeAddSurveyController } from '@main/factories/controllers/survey/add-survey/add-survey-controller-factory'
import { makeLoadSurveysController } from '@main/factories/controllers/survey/load-surveys/load-surveys-controller-factory'

export default (router: Router): void => {
    router.post('/add-survey', adminAuth, expressRouteAdapter(makeAddSurveyController()))
    router.get('/surveys', auth, expressRouteAdapter(makeLoadSurveysController()))
}
