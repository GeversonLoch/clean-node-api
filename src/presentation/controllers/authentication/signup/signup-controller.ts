import { IController, IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { IAddAccount, IAuthentication } from "@domain/usecases"
import { badRequest, forbidden, internalServerError, success } from "@presentation/helpers"
import { IValidation } from "@presentation/protocols"
import { InvalidCredentialsError } from "@presentation/errors"

export class SignUpController implements IController {
  constructor(
    private readonly validation: IValidation,
    private readonly addAccount: IAddAccount,
    private readonly authentication: IAuthentication
  ) {}

  async handle (httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }

      const { name, email, password } = httpRequest.body
      const account = await this.addAccount.add({
        name,
        email,
        password
      })

      const authResponse = await this.authentication.auth({
        email,
        password,
      })
      if (!account) {
        return forbidden(new InvalidCredentialsError())
      }

      return success(authResponse)
    } catch (error) {
      return internalServerError(error)
    }
  }
}