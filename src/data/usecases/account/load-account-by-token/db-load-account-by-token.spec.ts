import { mockLoadAccountByTokenRepository, mockDecrypter } from '@data/test'
import { DbLoadAccountByToken } from '@data/usecases'
import { mockAccountModel } from '@domain/test'

const accessToken = 'any_token'
const role = 'any_role'

const makeSut = () => {
    const decrypterStub = mockDecrypter()
    const loadAccountByTokenRepositoryStub = mockLoadAccountByTokenRepository()
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

    // Garrante que retorne uma conta em caso de sucesso.
    test('Shoud return an account on success', async () => {
        const { sut } = makeSut()
        const account = await sut.loadByToken(accessToken, role)
        expect(account).toEqual(mockAccountModel())
    })

    // Garante que DbLoadAccountByToken retorne nulo se o Decrypter lançar uma exceção.
    test('Shoud DbLoadAccountByToken to return null if Decrypter throws', async () => {
        const { sut, decrypterStub } = makeSut()
        jest.spyOn(decrypterStub, 'decrypt').mockImplementationOnce(() => {
            throw new Error()
        })
        const account = await sut.loadByToken(accessToken, role)
        await expect(account).toBeNull()
    })

    // Garante que DbLoadAccountByToken lance uma exceção se o LoadAccountByTokenRepository lançar uma exceção.
    test('Should throw if LoadAccountByTokenRepository throws', async () => {
        const { sut, loadAccountByTokenRepositoryStub } = makeSut()
        jest.spyOn(loadAccountByTokenRepositoryStub, 'loadByToken').mockImplementationOnce(() => {
            throw new Error()
        })
        const promise = sut.loadByToken(accessToken, role)
        await expect(promise).rejects.toThrow()
    })
})
