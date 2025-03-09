import { mongoDBAdapter as sut } from "@main/config/db-connection"

beforeAll(async () => {
    await sut.connect()
})

afterAll(async () => {
  await sut.disconnect()
})

describe('MongoDB Adapter', () => {
    // Garante que a conexão com o MongoDB seja reestabelecida após uma desconexão
    test('Should reconnect if MongoDB is down', async () => {
        let accountCollection = await sut.getCollection('accounts')
        expect(accountCollection).toBeTruthy()
        await sut.disconnect()
        accountCollection = await sut.getCollection('accounts')
        expect(accountCollection).toBeTruthy()
    })
})
