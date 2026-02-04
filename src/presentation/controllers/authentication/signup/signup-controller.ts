import { IController, IHttpResponse } from '@presentation/protocols'
import { IAddAccount, IAuthentication } from '@domain/usecases'
import { badRequest, forbidden, internalServerError, success } from '@presentation/helpers'
import { IValidation } from '@presentation/protocols'
import { InvalidCredentialsError } from '@presentation/errors'

export class SignUpController implements IController {
    constructor(
        private readonly validation: IValidation,
        private readonly addAccount: IAddAccount,
        private readonly authentication: IAuthentication,
    ) {}

    async handle(request: SignUpController.Request): Promise<IHttpResponse> {
        try {
            const error = this.validation.validate(request)
            if (error) {
                return badRequest(error)
            }

            const { name, email, password } = request
            const isValidAccount = await this.addAccount.add({
                name,
                email,
                password,
            })

            const authResponse = await this.authentication.auth({
                email,
                password,
            })
            if (!isValidAccount) {
                return forbidden(new InvalidCredentialsError())
            }

            return success(authResponse)
        } catch (error) {
            return internalServerError(error)
        }
    }
}

export namespace SignUpController {
    export type Request = {
        name: string
        email: string
        password: string
        passwordConfirmation: string
    }
}
