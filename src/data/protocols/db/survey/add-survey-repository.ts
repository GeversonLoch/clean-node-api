import { IAddSurveyModel } from '@domain/models'

export interface IAddSurveyRepository {
    add(surveyData: IAddSurveyModel): Promise<void>
}
