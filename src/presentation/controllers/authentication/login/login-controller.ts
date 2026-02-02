import { IAuthentication } from "@domain/usecases"
import { badRequest, internalServerError, success, unauthorized } from "@presentation/helpers"
import { IController, IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { IValidation } from "@presentation/protocols"

export class LoginController implements IController {
    constructor(
        private readonly validation: IValidation,
        private readonly authentication: IAuthentication,
    ) {}

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        try {
            const error = this.validation.validate(httpRequest.body)
            if (error) {
              return badRequest(error)
            }

            const { email, password } = httpRequest.body
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
