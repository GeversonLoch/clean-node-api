import { ISurveyModel } from '@domain/models'

export interface IAddSurvey {
    add(surveyData: IAddSurvey.Params): Promise<void>
}

export namespace IAddSurvey {
    export type Params = Omit<ISurveyModel, 'id'>
}
