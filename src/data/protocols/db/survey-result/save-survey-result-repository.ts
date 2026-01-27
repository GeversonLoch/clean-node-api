import { ISurveyResultModel } from "@domain/models";
import { ISaveSurveyResultParams } from "@domain/usecases";

export interface ISaveSurveyResultRepository {
    save(surveyData: ISaveSurveyResultParams): Promise<ISurveyResultModel>
}
