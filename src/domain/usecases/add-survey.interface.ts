import { IAddSurveyModel } from '@domain/models'

export interface IAddSurvey {
    add(surveyData: IAddSurveyModel): Promise<void>
}
