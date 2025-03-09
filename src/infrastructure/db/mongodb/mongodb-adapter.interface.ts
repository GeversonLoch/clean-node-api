import { IDatabaseAdapter } from "@data/protocols/database-adapter.interface"
import { Collection, WithId, Document } from "mongodb"

export interface IMongoDBAdapter extends IDatabaseAdapter {
  getCollection<T extends Document>(name: string): Promise<Collection<T>>
  map<T extends Document>(document: WithId<T> | null)
}