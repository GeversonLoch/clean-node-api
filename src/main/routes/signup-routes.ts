/**
* Define as rotas relacionadas ao cadastro de usuários.
*/

import { Router } from "express"
import { expressRouteAdapter } from "@main/adapters/express-route-adapter"
import { makeSignUpController } from "@main/factories/signup/signup"

export default (router: Router): void => {
    router.post('/signup', expressRouteAdapter(
        makeSignUpController()
    ))
}
