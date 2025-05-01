import { IAuthentication } from "@domain/usecases"
import { badRequest, internalServerError, success, unauthorizedError } from "@presentation/helpers"
import { IController, IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { IValidation } from "@presentation/protocols"

export class LoginController implements IController {
    private readonly authentication: IAuthentication
    private readonly validation: IValidation

    constructor(
        authentication: IAuthentication,
        validation: IValidation,
    ) {
        this.authentication = authentication
        this.validation = validation
    }

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
                return unauthorizedError()
            }

            return success({
                token: accessToken,
            })
        } catch (error) {
            return internalServerError(error)
        }
    }
}
