import { InvalidParamError, MissingParamError } from "@presentation/errors";
import { badRequest, internalServerError } from "@presentation/helpers";
import { IController, IEmailValidator, IHttpRequest, IHttpResponse } from "@presentation/protocols";

export class LoginController implements IController {
    private readonly emailValidator: IEmailValidator

    constructor(
        emailValidator: IEmailValidator,
    ) {
        this.emailValidator = emailValidator
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
        } catch (error) {
            return internalServerError(error)
        }
    }
}
