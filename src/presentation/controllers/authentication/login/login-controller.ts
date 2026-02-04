import { IAuthentication } from '@domain/usecases'
import { badRequest, internalServerError, success, unauthorized } from '@presentation/helpers'
import { IController, IHttpResponse } from '@presentation/protocols'
import { IValidation } from '@presentation/protocols'

export class LoginController implements IController {
    constructor(
        private readonly validation: IValidation,
        private readonly authentication: IAuthentication,
    ) {}

    async handle(request: LoginController.Request): Promise<IHttpResponse> {
        try {
            const error = this.validation.validate(request)
            if (error) {
                return badRequest(error)
            }

            const { email, password } = request
            const authResponse = await this.authentication.auth({
                email,
                password,
            })
            if (!authResponse) {
                return unauthorized()
            }

            return success(authResponse)
        } catch (error) {
            return internalServerError(error)
        }
    }
}

export namespace LoginController {
    export type Request = {
        email: string
        password: string
    }
}
