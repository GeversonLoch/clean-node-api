import { IValidation, RequiredFieldValidation, ValidationComposite, CompareFieldsValidation, EmailValidation } from "@presentation/helpers"
import { EmailValidatorAdapter } from "@utils/email-validator-adapter"

export const makeSignUpValidation = (): IValidation => {
    const validations: IValidation[] = []
    for (const field of ['name', 'email', 'password', 'passwordConfirmation']) {
        validations.push(new RequiredFieldValidation(field))
    }
    validations.push(new CompareFieldsValidation('password', 'passwordConfirmation'))
    validations.push(new EmailValidation('email', new EmailValidatorAdapter()))
    return new ValidationComposite(validations)
}
