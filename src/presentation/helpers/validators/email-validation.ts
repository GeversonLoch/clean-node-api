import { IValidation } from "@presentation/helpers"
import { InvalidParamError } from "@presentation/errors"
import { IEmailValidator } from "@presentation/protocols"

export class EmailValidation implements IValidation {
    private readonly fildName: string
    private readonly emailValidator: IEmailValidator

    constructor(fildName: string, emailValidator: IEmailValidator) {
        this.fildName = fildName
        this.emailValidator = emailValidator
    }

    validate(input: any): Error {
        const isValid = this.emailValidator.isValid(input[this.fildName])
        if (!isValid) {
            return new InvalidParamError(this.fildName)
        }
    }
}
