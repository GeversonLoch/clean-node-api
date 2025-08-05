import { ISurveyAnswersModel } from '@domain/models'

export interface IAddSurveyModel {
    question: string
    answers: Array<ISurveyAnswersModel>
    date?: Date
}
