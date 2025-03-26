/*
* Arquivo de testes do LogMongoRepository, responsável por validar se os logs são corretamente inseridos no MongoDB.
*/

import { mongoDBAdapter } from "@main/config/db-connection"
import { Collection } from "mongodb";
import { LogMongoRepository } from "@infrastructure/db"

let errorCollection: Collection;

beforeAll(async () => {
  await mongoDBAdapter.connect()
})

beforeEach(async () => {
  errorCollection = await mongoDBAdapter.getCollection('errors')
  await errorCollection.deleteMany({})
})

afterAll(async () => {
  await mongoDBAdapter.disconnect()
})

const makeSut = (): LogMongoRepository => {
  return new LogMongoRepository(mongoDBAdapter)
}

describe('Log Mongo Repository', () => {
  // Garante que, um log de erro seja criado em caso de sucesso
  test('Should create an error log on success', async () => {
    const sut = makeSut()
    await sut.logError('any_error')
    const count = await errorCollection.countDocuments()
    expect(count).toBe(1)
  })
})