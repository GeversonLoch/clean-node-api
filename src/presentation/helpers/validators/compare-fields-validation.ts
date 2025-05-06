import { IValidation } from "@presentation/protocols"
import { InvalidParamError } from "@presentation/errors"

export class CompareFieldsValidation implements IValidation {
    constructor(
        private readonly fildName: string, 
        private readonly fildToCompareName: string
    ) {}

    validate(input: any): Error {
        if (input[this.fildName] !== input[this.fildToCompareName]) {
            return new InvalidParamError(this.fildToCompareName)
        }
    }
}