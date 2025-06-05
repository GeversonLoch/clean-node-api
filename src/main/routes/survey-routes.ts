import { Router } from 'express'
import { expressRouteAdapter } from '@main/adapters/express/express-route-adapter'
import { makeAddSurveyController } from '@main/factories/controllers/survey/add-survey/add-survey-controller-factory'

export default (router: Router): void => {
    router.post('/add-survey', expressRouteAdapter(makeAddSurveyController()))
}
