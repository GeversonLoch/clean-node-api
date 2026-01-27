import { IAddSurveyRepository, ILoadSurveyByIdRepository, ILoadSurveysRepository } from '@data/protocols'
import { ISurveyModel } from '@domain/models'
import { IAddSurveyParams } from '@domain/usecases'
import { IMongoDBAdapter } from '@infrastructure/db'
import { ObjectId } from 'mongodb'

export class SurveyMongoRepository implements IAddSurveyRepository, ILoadSurveysRepository, ILoadSurveyByIdRepository {
    constructor(
        private readonly mongoDBAdapter: IMongoDBAdapter,
    ) {}

    async add(surveyData: IAddSurveyParams): Promise<void> {
        const surveyCollection = await this.mongoDBAdapter.getCollection('surveys')
        await surveyCollection.insertOne(surveyData)
    }

    async loadAll(): Promise<ISurveyModel[]> {
        const surveyCollection = await this.mongoDBAdapter.getCollection('surveys')
        const surveysDocuments = await surveyCollection.find().toArray()
        return this.mongoDBAdapter.mapAll(surveysDocuments)
    }

    async loadById(id: string): Promise<ISurveyModel> {
        const surveyCollection = await this.mongoDBAdapter.getCollection('surveys')
        const surveyDocument = await surveyCollection.findOne({ _id: new ObjectId(id) })
        return surveyDocument && this.mongoDBAdapter.map(surveyDocument)
    }
}
