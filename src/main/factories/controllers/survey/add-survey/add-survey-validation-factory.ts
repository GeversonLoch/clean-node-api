import {
    RequiredFieldValidation,
    ValidationComposite,
} from '@presentation/helpers'
import { IValidation } from '@presentation/protocols'

export const makeLoadSurveysValidation = (): IValidation => {
    const validations: IValidation[] = []
    for (const field of ['question', 'answers']) {
        validations.push(new RequiredFieldValidation(field))
    }
    return new ValidationComposite(validations)
}
