/**
* Define as rotas relacionadas ao cadastro de usuários.
*/

import { Router } from 'express'
import { expressRouteAdapter } from '@main/adapters/express/express-route-adapter'
import { makeSignUpController } from '@main/factories/controllers/signup/signup-controller-factory'
import { makeLoginController } from '@main/factories/controllers/login/login-controller-factory'

export default (router: Router): void => {
    router.post('/signup', expressRouteAdapter(makeSignUpController()))
    router.post('/login', expressRouteAdapter(makeLoginController()))
}
