import { Router } from 'express'
import { expressRouteAdapter } from '@main/adapters/express/express-route-adapter'
import { expressMiddlewareAdapter } from '@main/adapters/express/express-middleware-adapter'
import { makeAuthMiddleware } from '@main/factories/middlewares/auth-middlewares-factory'
import { makeAddSurveyController } from '@main/factories/controllers/survey/add-survey/add-survey-controller-factory'
import { makeLoadSurveysController } from '@main/factories/controllers/survey/load-surveys/load-surveys-controller-factory'

export default (router: Router): void => {
    const auth = expressMiddlewareAdapter(makeAuthMiddleware())
    const adminAuth = expressMiddlewareAdapter(makeAuthMiddleware('admin'))
    router.post('/add-survey', adminAuth, expressRouteAdapter(makeAddSurveyController()))
    router.post('/surveys', auth, expressRouteAdapter(makeLoadSurveysController()))
}
