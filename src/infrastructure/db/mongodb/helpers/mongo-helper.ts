import { Db, MongoClient } from 'mongodb'

export const MongoHelper = {
    client: null as MongoClient,
    db: null as Db,
    async connect(url: string): Promise<void> {
        this.client = await MongoClient.connect(url)
        this.db = await this.client.db()
    },
    async disconnect(): Promise<void> {
        await this.client.close()
    },
}