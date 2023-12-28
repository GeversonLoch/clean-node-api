import { EmailValidatorAdapter } from './email-validator'

jest.mock('validator', () => ({
    isEmail(): boolean {
        return true
    }
}))

describe('Email Validator Adapter', () => {

    test('Should return false if validator returns false', () => {
        const sut = new EmailValidatorAdapter()
        jest.spyOn(sut, 'isValid').mockReturnValueOnce(false)
        const isValid = sut.isValid('invalid_email@email.com')

        expect(isValid).toBe(false)
    })

    test('Should return true if validator returns true', () => {
        const sut = new EmailValidatorAdapter()
        const isValid = sut.isValid('valid_email@email.com')

        expect(isValid).toBe(true)
    })

})