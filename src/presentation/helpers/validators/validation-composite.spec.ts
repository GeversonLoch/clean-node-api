import { MissingParamError } from '@presentation/errors'
import {
    ValidationComposite,
} from '@presentation/helpers'
import { IValidation } from '@presentation/protocols'

const makeValidatorStub = (): IValidation => {
    class ValidatorStub implements IValidation {
        validate(input: string): Error {
            return null
        }
    }
    return new ValidatorStub()
}

const makeSut = () => {
    const validationStubs = [
        makeValidatorStub(),
        makeValidatorStub(),
    ]
    const sut = new ValidationComposite(validationStubs)
    return {
        sut,
        validationStubs,
    }
}

describe('Validation Composite', () => {
    // Garante que retorne um erro se alguma validação falhar
    test('Should return an error if any validation fails', () => {
        const { sut, validationStubs } = makeSut()
        jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(new MissingParamError('field'))
        const error = sut.validate({ field: 'any_field' })
        expect(error).toEqual(new MissingParamError('field'))
    })

    // Garrante que retorne o primeiro erro se mais de uma validação falhar
    test('Should return the first error if more than one validation fails', () => {
        const { sut, validationStubs } = makeSut()
        jest.spyOn(validationStubs[0], 'validate').mockReturnValueOnce(new MissingParamError('field1'))
        jest.spyOn(validationStubs[1], 'validate').mockReturnValueOnce(new MissingParamError('field2'))
        const error = sut.validate({ field: 'any_field' })
        expect(error).toEqual(new MissingParamError('field1'))
    })

    // Garante que não retorne nada se as validações forem bem-sucedidas
    test('Should not return if validations succeeds', () => {
        const { sut } = makeSut()
        const error = sut.validate({ field: 'any_field' })
        expect(error).toBeFalsy()
    })
})
