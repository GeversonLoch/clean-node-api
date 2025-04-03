import { IAuthenticator } from "@domain/usecases";
import { InvalidParamError, MissingParamError } from "@presentation/errors";
import { badRequest, internalServerError, unauthorizedError } from "@presentation/helpers";
import { IController, IEmailValidator, IHttpRequest, IHttpResponse } from "@presentation/protocols";

export class LoginController implements IController {
    private readonly emailValidator: IEmailValidator
    private readonly authenticator: IAuthenticator

    constructor(
        emailValidator: IEmailValidator,
        authenticator: IAuthenticator
    ) {
        this.emailValidator = emailValidator
        this.authenticator = authenticator
    }

    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        try {
            const requiredFields = ['email', 'password']
            const { email, password } = httpRequest.body

            for (const fild of requiredFields) {
                if (!httpRequest.body[fild]) {
                    return badRequest(new MissingParamError(fild))
                }
            }

            const isValid = this.emailValidator.isValid(email)

            if (!isValid) {
                return badRequest(new InvalidParamError('email'))
            }

            const accessToken = await this.authenticator.auth(email, password)
            if (!accessToken) {
                return unauthorizedError()
            }

        } catch (error) {
            return internalServerError(error)
        }
    }
}
