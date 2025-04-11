import { CompareFieldsValidation, IValidation, RequiredFieldValidation, ValidationComposite } from "@presentation/helpers"
import { makeSignUpValidation } from "./signup-validation"

jest.mock('@presentation/helpers/validators/validation-composite')

describe('SignUp Validation', () => {
    // Garante que o Validation Composite é chamado com todas as validações
    test('Should call Validation Composite with all validations', () => {
        makeSignUpValidation()
        const validations: IValidation[] = []
        for (const field of ['name', 'email', 'password', 'passwordConfirmation']) {
            validations.push(new RequiredFieldValidation(field))
        }
        validations.push(new CompareFieldsValidation('password', 'passwordConfirmation'))
        expect(ValidationComposite).toHaveBeenCalledWith(validations)
    })
})