import {
    RequiredFieldValidation,
    ValidationComposite,
    EmailValidation,
} from '@presentation/helpers'
import { IValidation } from '@presentation/protocols'
import { EmailValidatorAdapter } from '@main/adapters/validators/email-validator-adapter'

export const makeLoginValidation = (): IValidation => {
    const validations: IValidation[] = []
    for (const field of ['email', 'password']) {
        validations.push(new RequiredFieldValidation(field))
    }
    validations.push(new EmailValidation('email', new EmailValidatorAdapter()))
    return new ValidationComposite(validations)
}
