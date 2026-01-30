import { ISurveyResultAnswersModel } from '@domain/models'

export interface ISurveyResultModel {
    surveyId: string
    question: string
    answers: Array<ISurveyResultAnswersModel>
    date: Date
}
