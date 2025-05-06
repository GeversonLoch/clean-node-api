import { MissingParamError } from "@presentation/errors"
import { IValidation } from "@presentation/protocols"

export class RequiredFieldValidation implements IValidation {
    constructor(private readonly fildName: string) {}

    validate(input: any): Error {
        if (!input[this.fildName]) {
            return new MissingParamError(this.fildName)
        }
    }
}