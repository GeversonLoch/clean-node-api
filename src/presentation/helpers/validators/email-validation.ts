import { InvalidParamError } from "@presentation/errors"
import { IEmailValidator } from "@presentation/protocols"
import { IValidation } from "@presentation/protocols"

export class EmailValidation implements IValidation {
    constructor(
        private readonly fildName: string, 
        private readonly emailValidator: IEmailValidator
    ) {}

    validate(input: any): Error {
        const isValid = this.emailValidator.isValid(input[this.fildName])
        if (!isValid) {
            return new InvalidParamError(this.fildName)
        }
    }
}
