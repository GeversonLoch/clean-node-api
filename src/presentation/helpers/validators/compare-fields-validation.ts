import { IValidation } from "@presentation/protocols"
import { InvalidParamError } from "@presentation/errors"

export class CompareFieldsValidation implements IValidation {
    private readonly fildName: string
    private readonly fildToCompareName: string

    constructor(fildName: string, fildToCompareName: string) {
        this.fildName = fildName
        this.fildToCompareName = fildToCompareName
    }

    validate(input: any): Error {
        if (input[this.fildName] !== input[this.fildToCompareName]) {
            return new InvalidParamError(this.fildToCompareName)
        }
    }
}