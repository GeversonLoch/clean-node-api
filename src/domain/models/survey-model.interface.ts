import { ISurveyAnswersModel } from '@domain/models'

export interface ISurveyModel {
    id: string
    question: string
    answers: Array<ISurveyAnswersModel>
    date?: Date
}
