import { ISurveyModel } from '@domain/models'
import { IAddSurveyParams } from '@domain/usecases'

export const mockSurveyModel = (): ISurveyModel => {
    return {
        id: 'any_id',
        question: 'any_question',
        answers: [
            {
                answer: 'any_answer',
                image: 'any_image',
            },
        ],
        date: new Date(),
    }
}

export const mockSurveyModelCollection = (): ISurveyModel[] => {
    return [mockSurveyModel(), mockSurveyModel()]
}

export const mockAddSurveyParams = (): IAddSurveyParams => ({
    question: 'any_question',
    answers: [
        {
            answer: 'any_answer',
            image: 'any_image',
        },
        {
            answer: 'other_answer',
            image: 'other_image',
        },
        {
            answer: 'another_answer',
            image: 'another_image',
        },
    ],
    date: new Date(),
})

export const mockAddSurveyParamsCollection = (): IAddSurveyParams[] => {
    return [mockAddSurveyParams(), mockAddSurveyParams()]
}
