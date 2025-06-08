import { IDecrypter, ILoadAccountByTokenRepository } from '@data/protocols'
import { DbLoadAccountByToken } from '@data/usecases'
import { IAccountModel } from '@domain/models'

const accessToken = 'any_token'
const role = 'any_role'
const decryptToken = 'any_decrypted_value'

const makeDecrypterStub = (): IDecrypter => {
    class Decrypter implements IDecrypter {
        async decrypt(value: string): Promise<string> {
            return Promise.resolve(decryptToken)
        }
    }
    return new Decrypter()
}

const makeFakeAccount = (): IAccountModel => ({
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@email.com',
    password: 'any_password',
})

const makeLoadAccountByTokenRepositoryStub = (): ILoadAccountByTokenRepository => {
    class LoadAccountByTokenRepository implements ILoadAccountByTokenRepository {
        async loadByToken(accessToken: string, role?: string): Promise<IAccountModel> {
            return Promise.resolve(makeFakeAccount())
        }
    }
    return new LoadAccountByTokenRepository()
}

const makeSut = () => {
    const decrypterStub = makeDecrypterStub()
    const loadAccountByTokenRepositoryStub = makeLoadAccountByTokenRepositoryStub()
    const sut = new DbLoadAccountByToken(decrypterStub, loadAccountByTokenRepositoryStub)
    return {
        sut,
        decrypterStub,
        loadAccountByTokenRepositoryStub,
    }
}

describe('DbLoadAccountByToken Usecase', () => {
    // Garrante que Decrypter seja chamado com os valores corretos.
    test('Shoud call Decrypter with correct values', async () => {
        const { sut, decrypterStub } = makeSut()
        const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')
        await sut.loadByToken(accessToken, role)
        expect(decryptSpy).toHaveBeenCalledWith(accessToken)
    })

    // Garrante que DbLoadAccountByToken retorne nulo se Decrypter retornar nulo.
    test('Shoud return null if Decrypter returns null', async () => {
        const { sut, decrypterStub } = makeSut()
        jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(Promise.resolve(null))
        const account = await sut.loadByToken(accessToken, role)
        expect(account).toBeNull()
    })

    // Garrante que LoadAccountByTokenRepository seja chamado com os valores corretos.
    test('Shoud call LoadAccountByTokenRepository with correct values', async () => {
        const { sut, loadAccountByTokenRepositoryStub } = makeSut()
        const loadByTokenSpy = jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken')
        await sut.loadByToken(accessToken, role)
        expect(loadByTokenSpy).toHaveBeenCalledWith(accessToken, role)
    })

    // Garrante que DbLoadAccountByToken retorne nulo se LoadAccountByTokenRepository retornar nulo.
    test('Shoud return null if LoadAccountByTokenRepository returns null', async () => {
        const { sut, loadAccountByTokenRepositoryStub } = makeSut()
        jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken').mockReturnValueOnce(
            Promise.resolve(null),
        )
        const account = await sut.loadByToken(accessToken, role)
        expect(account).toBeNull()
    })
})
