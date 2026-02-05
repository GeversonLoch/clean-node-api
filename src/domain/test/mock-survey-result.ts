import { ISurveyResultModel } from '@domain/models'
import { ISaveSurveyResult } from '@domain/usecases'

export const mockSaveSurveyResultParams = (): ISaveSurveyResult.Params => ({
    surveyId: 'any_survey_id',
    accountId: 'any_account_id',
    question: 'any_question',
    answer: 'any_answer',
    date: new Date(),
})

export const mockSurveyResultModel = (): ISurveyResultModel => ({
    surveyId: 'any_id',
    question: 'any_question',
    answers: [
        {
            answer: 'any_answer',
            image: 'any_image',
            count: 1,
            percent: 40,
            isCurrentAccountAnswer: true,
        },
        {
            answer: 'other_answer',
            image: 'other_image',
            count: 1,
            percent: 60,
            isCurrentAccountAnswer: false,
        },
    ],
    date: new Date(),
})

export const mockSurveyResultEmptyModel = (): ISurveyResultModel => ({
    surveyId: 'any_id',
    question: 'any_question',
    answers: [
        {
            answer: 'any_answer',
            image: 'any_image',
            count: 0,
            percent: 0,
            isCurrentAccountAnswer: false,
        },
    ],
    date: new Date(),
})
