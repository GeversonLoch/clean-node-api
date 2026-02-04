import { ISurveyModel } from '@domain/models'
import { IAddSurvey } from '@domain/usecases'

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

export const mockAddSurveyParams = (): IAddSurvey.Params => ({
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

export const mockAddSurveyParamsCollection = (): IAddSurvey.Params[] => {
    return [mockAddSurveyParams(), mockAddSurveyParams()]
}
