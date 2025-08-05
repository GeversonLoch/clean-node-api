import { IAddSurveyRepository, ILoadSurveysRepository } from '@data/protocols'
import { IAddSurveyModel, ISurveyModel } from '@domain/models'
import { IMongoDBAdapter } from '@infrastructure/db'

export class SurveyMongoRepository implements IAddSurveyRepository, ILoadSurveysRepository {
    constructor(
        private readonly mongoDBAdapter: IMongoDBAdapter,
    ) {}

    async add(surveyData: IAddSurveyModel): Promise<void> {
        const surveyCollection = await this.mongoDBAdapter.getCollection('surveys')
        await surveyCollection.insertOne(surveyData)
    }

    async loadAll(): Promise<ISurveyModel[]> {
        const surveyCollection = await this.mongoDBAdapter.getCollection('surveys')
        const surveysDocuments = await surveyCollection.find().toArray()
        return this.mongoDBAdapter.mapAll(surveysDocuments) as ISurveyModel[]
    }
}
