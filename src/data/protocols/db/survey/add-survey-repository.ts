import { IAddSurveyParams } from '@domain/usecases'

export interface IAddSurveyRepository {
    add(surveyData: IAddSurveyParams): Promise<void>
}
