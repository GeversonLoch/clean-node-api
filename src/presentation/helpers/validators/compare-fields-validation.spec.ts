import { CompareFieldsValidation } from "@presentation/helpers"
import { InvalidParamError } from "@presentation/errors"

const makeSut = () => {
    return new CompareFieldsValidation('field', 'fieldToCompare')
}

describe('Compare Fields Validation', () => {
    // Garante que se a validação falhar retorne com um InvalidParamError
    test('Should return a InvalidParamError if validation fails', () => {
        const sut = makeSut()
        const error = sut.validate({
            field: 'any_compare_value',
            fieldToCompare: 'incorrect_compare_value'
        })
        expect(error).toEqual(new InvalidParamError('fieldToCompare'))
    })

    // Garante que se a validação passar não retorne nada
    test('Should not return if validation succeeds', () => {
        const sut = makeSut()
        const error = sut.validate({
            field: 'any_compare_value',
            fieldToCompare: 'any_compare_value'
        })
        expect(error).toBeFalsy()
    })
})
