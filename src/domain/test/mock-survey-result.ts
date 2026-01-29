import { ISurveyResultModel } from '@domain/models'
import { ISaveSurveyResultParams } from '@domain/usecases'

export const mockSaveSurveyResultParams = (): ISaveSurveyResultParams => ({
    surveyId: 'any_survey_id',
    accountId: 'any_account_id',
    question: 'any_question',
    answer: 'any_answer',
    date: new Date(),
})

export const mockSurveyResultModel = (): ISurveyResultModel => Object.assign({}, mockSaveSurveyResultParams(), {
    id: 'any_id',
})
