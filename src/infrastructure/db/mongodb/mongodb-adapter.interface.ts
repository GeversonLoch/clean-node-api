import { IDatabase } from '@data/protocols'
import { Collection, Document } from 'mongodb'

export interface IMongoDBAdapter extends IDatabase {
    getCollection<T extends Document>(name: string): Promise<Collection<T>>
    map<T extends Document>(document: T | null)
    mapCollection<T extends Document>(documents: T[])
}
