import {
    RequiredFieldValidation,
    ValidationComposite,
} from '@presentation/helpers'
import { makeAddSurveyValidation } from './add-survey-validation-factory'
import { IValidation } from '@presentation/protocols'

jest.mock('@presentation/helpers/validators/validation-composite')

describe('AddSurvey Validation', () => {
    // Garante que o Validation Composite é chamado com todas as validações
    test('Should call Validation Composite with all validations', () => {
        makeAddSurveyValidation()
        const validations: IValidation[] = []
        for (const field of ['question', 'answers']) {
            validations.push(new RequiredFieldValidation(field))
        }
        expect(ValidationComposite).toHaveBeenCalledWith(validations)
    })
})
