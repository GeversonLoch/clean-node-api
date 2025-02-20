import { MongoClient, Db, Collection, WithId, Document } from 'mongodb'
import { IMongoHelper } from '../protocols/mongo-helper'

export class MongoHelper implements IMongoHelper {
  private client: MongoClient
  private db: Db

  constructor(
    private readonly url: string,
    private readonly dbName: string
  ) {}

  public async connect(): Promise<void> {
    if (!this.client) {
      this.client = new MongoClient(this.url)
      await this.client.connect()
      this.db = this.client.db(this.dbName)
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
    }
  }

  public getCollection<T extends Document>(name: string): Collection<T> {
    if (!this.db) {
      throw new Error("MongoDB is not connected.")
    }
    return this.db.collection<T>(name)
  }

  // Mapeia o documento do MongoDB, convertendo _id para id
  public map<T extends Document>(document: WithId<T> | null) {
    if (document) {
      const { _id, ...documentWithoutId } = document
      return { id: _id, ...documentWithoutId }
    }
    return null
  }
}
