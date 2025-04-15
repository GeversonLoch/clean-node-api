import { RequiredFieldValidation } from "@presentation/helpers"
import { MissingParamError } from "@presentation/errors"

const makeSut = () => {
    const sut = new RequiredFieldValidation('field')
    return {
        sut,
    }
}

describe('Compare Fields Validation', () => {
    // Garante que se a validação falhar retorne com um MissingParamError
    test('Should return a MissingParamError if validation fails', () => {
        const { sut } = makeSut()
        const error = sut.validate({ incorrectFild: 'any_value' })
        expect(error).toEqual(new MissingParamError('field'))
    })

    // Garante que se a validação passar não retorne nada
    test('Should not return if validation succeeds', () => {
        const { sut } = makeSut()
        const error = sut.validate({ field: 'any_value' })
        expect(error).toBeFalsy()
    })
})
