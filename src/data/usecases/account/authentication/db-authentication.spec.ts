import { DbAuthentication } from '@data/usecases'
import {
    mockLoadAccountByEmailRepository,
    mockEncrypter,
    mockHashComparer,
    mockUpdateAccessTokenRepository,
} from '@data/test'
import { mockAuthenticationModel, mockAuthenticationParams } from '@domain/test'

const makeSut = () => {
    const loadAccountByEmailRepositoryStub = mockLoadAccountByEmailRepository()
    const hashComparerStub = mockHashComparer()
    const encrypterStub = mockEncrypter()
    const updateAccessTokenRepositoryStub = mockUpdateAccessTokenRepository()
    const sut = new DbAuthentication(
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        encrypterStub,
        updateAccessTokenRepositoryStub,
    )
    return {
        sut,
        loadAccountByEmailRepositoryStub,
        hashComparerStub,
        encrypterStub,
        updateAccessTokenRepositoryStub,
    }
}

describe('DbAuthentication Usecase', () => {
    // Garante que LoadAccountByEmailRepository seja chamado com o email correto
    test('Should call LoadAccountByEmailRepository with correct email', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
        await sut.auth(mockAuthenticationParams())
        expect(loadSpy).toHaveBeenCalledWith('any_email@email.com')
    })

    // Garante que DbAuthentication lance uma exceção se o LoadAccountByEmailRepository lançar
    test('Should throw if LoadAccountByEmailRepository throws', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockImplementationOnce(() => {
            throw new Error()
        })
        const promise = sut.auth(mockAuthenticationParams())
        await expect(promise).rejects.toThrow()
    })

    // Garante que DbAuthentication retorne null se o LoadAccountByEmailRepository retornar null
    test('Should return null if LoadAccountByEmailRepository returns null', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(null)
        const authResponse = await sut.auth(mockAuthenticationParams())
        expect(authResponse).toBeNull()
    })

    // Garante que chame HashComparer com a senha correta
    test('Should call HashComparer with correct values', async () => {
        const { sut, hashComparerStub } = makeSut()
        const compareSpy = jest.spyOn(hashComparerStub, 'compare')
        await sut.auth(mockAuthenticationParams())
        expect(compareSpy).toHaveBeenCalledWith('any_password', 'any_password')
    })

    // Garante que DbAuthentication lance uma exceção se o HashComparer lançar
    test('Should throw if HashComparer throws', async () => {
        const { sut, hashComparerStub } = makeSut()
        jest.spyOn(hashComparerStub, 'compare').mockImplementationOnce(() => {
            throw new Error()
        })
        const promise = sut.auth(mockAuthenticationParams())
        await expect(promise).rejects.toThrow()
    })

    // Garante que DbAuthentication retorne null se o HashComparer retornar false
    test('Should return null if HashComparer returns false', async () => {
        const { sut, hashComparerStub } = makeSut()
        jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(Promise.resolve(false))
        const authResponse = await sut.auth(mockAuthenticationParams())
        expect(authResponse).toBeNull()
    })

    // Garante que Encrypter seja chamado com id correto
    test('Should call Encrypter with correct id', async () => {
        const { sut, encrypterStub } = makeSut()
        const generateSpy = jest.spyOn(encrypterStub, 'encrypt')
        await sut.auth(mockAuthenticationParams())
        expect(generateSpy).toHaveBeenCalledWith('any_id')
    })

    // Garante que DbAuthentication lance uma exceção se o Encrypter lançar
    test('Should throw if Encrypter throws', async () => {
        const { sut, encrypterStub } = makeSut()
        jest.spyOn(encrypterStub, 'encrypt').mockImplementationOnce(() => {
            throw new Error()
        })
        const promise = sut.auth(mockAuthenticationParams())
        await expect(promise).rejects.toThrow()
    })

    // Garante que DbAuthentication retorne um token em caso de sucesso
    test('Should return an data on success', async () => {
        const { sut } = makeSut()
        const authResponse = await sut.auth(mockAuthenticationParams())
        expect(authResponse).toEqual(mockAuthenticationModel())
    })

    // Garante que chame UpdateAccessTokenRepository com valores corretos
    test('Should call UpdateAccessTokenRepository with correct values', async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut()
        const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken')
        await sut.auth(mockAuthenticationParams())
        expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token')
    })

    // Garante que DbAuthentication lance uma exceção se o UpdateAccessTokenRepository lançar
    test('Should throw if UpdateAccessTokenRepository throws', async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut()
        jest.spyOn(updateAccessTokenRepositoryStub, 'updateAccessToken').mockImplementationOnce(() => {
            throw new Error()
        })
        const promise = sut.auth(mockAuthenticationParams())
        await expect(promise).rejects.toThrow()
    })
})
