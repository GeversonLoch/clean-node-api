import {
    IValidation,
    RequiredFieldValidation,
    ValidationComposite,
    EmailValidation,
} from '@presentation/helpers'
import { EmailValidatorAdapter } from '@utils/email-validator-adapter'

export const makeLoginValidation = (): IValidation => {
    const validations: IValidation[] = []
    for (const field of ['email', 'password']) {
        validations.push(new RequiredFieldValidation(field))
    }
    validations.push(new EmailValidation('email', new EmailValidatorAdapter()))
    return new ValidationComposite(validations)
}
