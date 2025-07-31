import { Router } from 'express'
import { expressRouteAdapter } from '@main/adapters/express/express-route-adapter'
import { makeAddSurveyController } from '@main/factories/controllers/survey/add-survey/add-survey-controller-factory'
import { expressMiddlewareAdapter } from '@main/adapters/express/express-middleware-adapter'
import { makeAuthMiddleware } from '@main/factories/middlewares/auth-middlewares-factory'

export default (router: Router): void => {
    const adminAuth = expressMiddlewareAdapter(makeAuthMiddleware('admin'))
    router.post('/add-survey', adminAuth, expressRouteAdapter(makeAddSurveyController()))
}
