import { mongoDBAdapter } from "@main/config/db-connection"

beforeAll(async () => {
    await mongoDBAdapter.connect()
})

afterAll(async () => {
  await mongoDBAdapter.disconnect()
})

describe('MongoDB Adapter', () => {
    // Garante que a conexão com o MongoDB seja reestabelecida após uma desconexão
    test('Should reconnect if MongoDB is down', async () => {
        let accountCollection = await mongoDBAdapter.getCollection('accounts')
        expect(accountCollection).toBeTruthy()
        await mongoDBAdapter.disconnect()
        accountCollection = await mongoDBAdapter.getCollection('accounts')
        expect(accountCollection).toBeTruthy()
    })
})
