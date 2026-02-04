import { IAddSurveyRepository, ILoadSurveyByIdRepository, ILoadSurveysRepository } from '@data/protocols'
import { ISurveyModel } from '@domain/models'
import { IMongoDBAdapter, QueryBuilder } from '@infrastructure/db'
import { ObjectId } from 'mongodb'

export class SurveyMongoRepository implements 
    IAddSurveyRepository,
    ILoadSurveysRepository,
    ILoadSurveyByIdRepository {
    constructor(
        private readonly mongoDBAdapter: IMongoDBAdapter,
    ) {}

    async add(surveyData: IAddSurveyRepository.Params): Promise<void> {
        const surveyCollection = await this.mongoDBAdapter.getCollection('surveys')
        await surveyCollection.insertOne(surveyData)
    }

    async loadAll(accountId: string): Promise<ISurveyModel[]> {
        const surveyCollection = await this.mongoDBAdapter.getCollection('surveys')
        const query = new QueryBuilder()
        .lookup({
            from: 'surveyResults',
            foreignField: 'surveyId',
            localField: '_id',
            as: 'result'
        })
        .project({
            _id: 1,
            question: 1,
            answers: 1,
            date: 1,
            didAnswer: {
                $gte: [{
                    $size: {
                        $filter: {
                            input: '$result',
                            as: 'item',
                            cond: {
                                $eq: ['$$item.accountId', new ObjectId(accountId)]
                            }
                        }
                    }
                }, 1]
            }
        })
        .build()
        const surveysDocuments = await surveyCollection.aggregate(query).toArray()
        return this.mongoDBAdapter.mapCollection(surveysDocuments)
    }

    async loadById(id: string): Promise<ILoadSurveyByIdRepository.Result> {
        const surveyCollection = await this.mongoDBAdapter.getCollection('surveys')
        const surveyDocument = await surveyCollection.findOne({ _id: new ObjectId(id) })
        return surveyDocument && this.mongoDBAdapter.map(surveyDocument)
    }
}
