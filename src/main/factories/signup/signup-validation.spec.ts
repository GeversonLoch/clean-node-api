import { CompareFieldsValidation, EmailValidation, RequiredFieldValidation, ValidationComposite } from "@presentation/helpers"
import { makeSignUpValidation } from "./signup-validation"
import { IEmailValidator } from "@presentation/protocols"
import { IValidation } from "@presentation/protocols"

jest.mock('@presentation/helpers/validators/validation-composite')

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
      isValid(email: string): boolean {
        return true
      }
    }
    return new EmailValidatorStub()
}

describe('SignUp Validation', () => {
    // Garante que o Validation Composite é chamado com todas as validações
    test('Should call Validation Composite with all validations', () => {
        makeSignUpValidation()
        const validations: IValidation[] = []
        for (const field of ['name', 'email', 'password', 'passwordConfirmation']) {
            validations.push(new RequiredFieldValidation(field))
        }
        validations.push(new CompareFieldsValidation('password', 'passwordConfirmation'))
        validations.push(new EmailValidation('email', makeEmailValidator()))
        expect(ValidationComposite).toHaveBeenCalledWith(validations)
    })
})