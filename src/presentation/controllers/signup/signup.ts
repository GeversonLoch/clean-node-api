import { IController, IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { IAddAccount } from "@domain/usecases"
import { badRequest, internalServerError, success } from "@presentation/helpers"
import { IValidation } from "@presentation/protocols"

export class SignUpController implements IController {
  private readonly addAccount: IAddAccount
  private readonly validation: IValidation

  constructor(
    addAccount: IAddAccount,
    validation: IValidation,
  ) {
    this.addAccount = addAccount
    this.validation = validation
  }

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

      return success(account)
    } catch (error) {
      return internalServerError(error)
    }
  }
}