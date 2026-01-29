import { IValidation } from '@presentation/protocols'
import { IEmailValidator } from '@presentation/protocols'

export const mockValidation = (): IValidation => {
    class ValidationStub implements IValidation {
        validate(input: string): Error {
            return null
        }
    }
    return new ValidationStub()
}

export const mockEmailValidator = (): IEmailValidator => {
    class EmailValidatorStub implements IEmailValidator {
        isValid(email: string): boolean {
            return true
        }
    }
    return new EmailValidatorStub()
}
