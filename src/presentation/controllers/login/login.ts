import { IAuthenticator } from "@domain/usecases";
import { badRequest, internalServerError, IValidation, success, unauthorizedError } from "@presentation/helpers";
import { IController, IHttpRequest, IHttpResponse } from "@presentation/protocols";

export class LoginController implements IController {
    private readonly authenticator: IAuthenticator
    private readonly validation: IValidation

    constructor(
        authenticator: IAuthenticator,
        validation: IValidation,
    ) {
        this.authenticator = authenticator
        this.validation = validation
    }

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        try {
            const error = this.validation.validate(httpRequest.body)
            if (error) {
              return badRequest(error)
            }

            const { email, password } = httpRequest.body
            const accessToken = await this.authenticator.auth(email, password)
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
