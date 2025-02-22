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
