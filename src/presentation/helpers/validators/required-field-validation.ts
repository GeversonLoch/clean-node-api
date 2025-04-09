import { IValidation } from "@presentation/helpers"
import { MissingParamError } from "@presentation/errors"

export class RequiredFieldValidation implements IValidation {
    private readonly fildName: string

    constructor(fildName: string) {
        this.fildName = fildName
    }

    validate(input: any): Error {
        if (!input[this.fildName]) {
            return new MissingParamError(this.fildName)
        }
    }
}