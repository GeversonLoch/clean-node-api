import { IMongoDBAdapter } from "@infrastructure/db"
import { MongoClient, Db, Collection, Document } from "mongodb"

export class MongoDBAdapter implements IMongoDBAdapter {
  private client: MongoClient
  private db: Db
  private isConnected = false

  constructor(
    private readonly url: string,
    private readonly dbName: string
  ) {}

  public async connect(): Promise<void> {
    if (!this.client) {
      this.client = new MongoClient(this.url)
      this.registerConnectionEvents()
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

  private registerConnectionEvents(): void {
    this.client.on('connect', () => {
      this.isConnected = true
    })
    this.client.on('disconnect', () => {
      this.isConnected = false
    })
  }

  public async getCollection<T extends Document>(name: string): Promise<Collection<T>> {
    if (!this.isConnected) {
      await this.connect()
    }
    return this.db.collection<T>(name)
  }

  // Mapeia o documento do MongoDB, convertendo _id para id
  public map<T extends Document>(document: T | null): any {
    if (!document) return null
    const { _id, ...data } = document
    return { id: _id, ...data }
  }

  public mapCollection<T extends Document>(documents: T[]): any[] {
    return documents.map(doc => this.map(doc))
  }
}
