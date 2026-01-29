import { ISaveSurveyResultRepository } from '@data/protocols'
import { ISurveyResultModel } from '@domain/models'
import { ISaveSurveyResultParams } from '@domain/usecases'
import { IMongoDBAdapter } from '@infrastructure/db'
import { ObjectId } from 'mongodb'

export class SurveyResultMongoRepository implements ISaveSurveyResultRepository {
    constructor(
        private readonly mongoDBAdapter: IMongoDBAdapter,
    ) {}

    async save(data: ISaveSurveyResultParams): Promise<ISurveyResultModel> {
        const surveyResultCollection = await this.mongoDBAdapter.getCollection('surveyResults')
        const res = await surveyResultCollection.findOneAndUpdate(
            {
                surveyId: new ObjectId(data.surveyId),
                accountId: new ObjectId(data.accountId),
            },
            {
                $set: {
                    answer: data.answer,
                    date: data.date,
                },
                $setOnInsert: {
                    question: data.question
                },
            },
            {
                upsert: true,
                returnDocument: 'after',
            },
        )
        return this.mongoDBAdapter.map(res)
    }
}
