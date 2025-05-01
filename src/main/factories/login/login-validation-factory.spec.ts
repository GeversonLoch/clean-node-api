import {
    EmailValidation,
    RequiredFieldValidation,
    ValidationComposite,
} from '@presentation/helpers'
import { makeLoginValidation } from './login-validation-factory'
import { IEmailValidator, IValidation } from '@presentation/protocols'

jest.mock('@presentation/helpers/validators/validation-composite')

const makeEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true
        }
    }
    return new EmailValidatorStub()
}

describe('Login Validation', () => {
    // Garante que o Validation Composite é chamado com todas as validações
    test('Should call Validation Composite with all validations', () => {
        makeLoginValidation()
        const validations: IValidation[] = []
        for (const field of ['email', 'password']) {
            validations.push(new RequiredFieldValidation(field))
        }
        validations.push(new EmailValidation('email', makeEmailValidator()))
        expect(ValidationComposite).toHaveBeenCalledWith(validations)
    })
})
