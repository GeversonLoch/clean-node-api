import { ISurveyResultModel } from "@domain/models";
import { ISaveSurveyResultModel } from "@domain/usecases";

export interface ISaveSurveyResultRepository {
    save(surveyData: ISaveSurveyResultModel): Promise<ISurveyResultModel>
}
