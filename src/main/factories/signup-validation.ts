import { IValidation, RequiredFieldValidation, ValidationComposite, CompareFieldsValidation } from "@presentation/helpers"

export const makeSignUpValidation = (): IValidation => {
    const validations: IValidation[] = []
    for (const field of ['name', 'email', 'password', 'passwordConfirmation']) {
        validations.push(new RequiredFieldValidation(field))
    }
    validations.push(new CompareFieldsValidation('password', 'passwordConfirmation'))
    return new ValidationComposite(validations)
}