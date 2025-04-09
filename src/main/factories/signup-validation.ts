import { IValidation, RequiredFieldValidation, ValidationComposite } from "@presentation/helpers"

export const makeSignUpValidation = (): IValidation => {
    const validations: IValidation[] = []
    for (const field of ['name', 'email', 'password', 'passwordConfirmation']) {
        validations.push(new RequiredFieldValidation(field))
    }
    return new ValidationComposite(validations)
}