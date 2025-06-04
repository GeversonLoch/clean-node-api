import { IAddSurveyRepository } from '@data/protocols'
import { IAddSurveyModel } from '@domain/models'
import { IMongoDBAdapter } from '@infrastructure/db'

export class SurveyMongoRepository implements IAddSurveyRepository {
    constructor(private readonly mongoDBAdapter: IMongoDBAdapter) {}

    async add(surveyData: IAddSurveyModel): Promise<void> {
        const surveyCollection = await this.mongoDBAdapter.getCollection('surveys')
        await surveyCollection.insertOne(surveyData)
    }
}
