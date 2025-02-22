import { Collection, WithId, Document } from "mongodb"

export interface IMongoHelper {
  connect(): Promise<void>
  disconnect(): Promise<void>
  getCollection<T extends Document>(name: string): Collection<T>
  map<T extends Document>(document: WithId<T> | null)
}
