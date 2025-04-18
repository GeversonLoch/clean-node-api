import { MissingParamError } from '@presentation/errors'
import {
    IValidation,
    ValidationComposite,
} from '@presentation/helpers'

const makeValidatorStub = (): IValidation => {
    class ValidatorStub implements IValidation {
        validate(input: string): Error {
            return null
        }
    }
    return new ValidatorStub()
}

const makeSut = () => {
    const validatorStub = makeValidatorStub()
    const sut = new ValidationComposite([validatorStub])
    return {
        sut,
        validatorStub,
    }
}

describe('Validation Composite', () => {
    // Garante que retorne um erro se alguma validação falhar
    test('Should return an error if any validation fails', () => {
        const { sut, validatorStub } = makeSut()
        jest.spyOn(validatorStub, 'validate').mockReturnValueOnce(new MissingParamError('field'))
        const error = sut.validate({ field: 'any_field' })
        expect(error).toEqual(new MissingParamError('field'))
    })
})
