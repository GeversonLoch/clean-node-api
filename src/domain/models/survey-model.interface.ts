import { ISurveyAnswersModel } from '@domain/models'

export interface ISurveyModel {
    id: number
    question: string
    answers: Array<ISurveyAnswersModel>
}
