import { IAddSurveyModel } from '@domain/models'

export interface IAddSurvey {
    add(survey: IAddSurveyModel): Promise<void>
}
