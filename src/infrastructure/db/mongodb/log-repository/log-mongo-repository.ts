import { ILogErrorRepository } from "@data/protocols"
import { IMongoDBAdapter } from "@infrastructure/db"

export class LogMongoRepository implements ILogErrorRepository {
    constructor(private readonly mongoDBAdapter: IMongoDBAdapter) {}

    // Adiciona um novo log de erro na coleção 'errors' do MongoDB.
    async logError(stack: string): Promise<void> {
        const logErrorCollection = await this.mongoDBAdapter.getCollection('errors')
        await logErrorCollection.insertOne({
            stack,
            date: new Date()
        })
    }
}