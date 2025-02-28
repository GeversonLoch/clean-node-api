/*
* Testes de integração para o repositório de contas utilizando o MongoDB.
* O ambiente de teste é configurado com a conexão ao banco de dados e a limpeza da coleção 'accounts'
* é realizada antes de cada teste, garantindo um ambiente isolado e consistente. As operações de inserção
* de contas são validadas para assegurar a correta persistência dos dados.
*/

import { AccountMongoRepository, MongoHelper } from "@infrastructure/db"

let mongoHelper: MongoHelper

beforeAll(async () => {
  mongoHelper = new MongoHelper(process.env.MONGO_URL, 'jest')
  await mongoHelper.connect()
})

beforeEach(async () => {
  const accountCollection = mongoHelper.getCollection('accounts')
  await accountCollection.deleteMany({})
})

afterAll(async () => {
  await mongoHelper.disconnect()
})

describe("Account Mongo Repository", () => {
  /* Garante que, ao adicionar uma conta, o método 'add' do repositório retorna um objeto válido,
  com um ID gerado e os dados (nome, email, senha) corretamente persistidos. */
  test("Should return an account on success", async () => {
    const sut = new AccountMongoRepository(mongoHelper)
    const account = await sut.add({
      name: "valid_name",
      email: "valid_email@email.com",
      password: "hashed_password",
    })
    expect(account).toBeTruthy()
    expect(account.id).toBeTruthy()
    expect(account.name).toBe("valid_name")
    expect(account.email).toBe("valid_email@email.com")
    expect(account.password).toBe("hashed_password")
  })
})
