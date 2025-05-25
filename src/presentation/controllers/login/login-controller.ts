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
            const accessToken = await this.authentication.auth({
                email,
                password,
            })
            if (!accessToken) {
                return unauthorized()
            }

            return success({
                token: accessToken,
            })
        } catch (error) {
            return internalServerError(error)
        }
    }
}
