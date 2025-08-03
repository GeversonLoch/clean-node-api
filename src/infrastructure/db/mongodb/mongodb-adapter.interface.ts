import { IDatabaseAdapter } from '@data/protocols'
import { Collection, WithId, Document } from 'mongodb'

export interface IMongoDBAdapter extends IDatabaseAdapter {
    getCollection<T extends Document>(name: string): Promise<Collection<T>>
    map<T extends Document>(document: WithId<T> | null)
    mapAll<T extends Document>(documents: WithId<T>[])
}
