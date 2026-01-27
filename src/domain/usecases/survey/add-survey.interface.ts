import { ISurveyModel } from '@domain/models'

export type IAddSurveyParams = Omit<ISurveyModel, 'id'>

export interface IAddSurvey {
    add(surveyData: IAddSurveyParams): Promise<void>
}
