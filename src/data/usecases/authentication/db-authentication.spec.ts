import {
    IHashComparer,
    ILoadAccountByEmailRepository,
    IEncrypter,
    IUpdateAccessTokenRepository,
} from '@data/protocols'
import { DbAuthentication } from '@data/usecases'
import { IAccountModel } from '@domain/models'

const makeFakeAccount = (): IAccountModel => ({
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'hashed_password',
})

const makeFakeAuthentication = () => ({
    email: 'any_email@mail.com',
    password: 'any_password',
})

const makeLoadAccountByEmailRepository = () => {
    class LoadAccountByEmailRepositoryStub implements ILoadAccountByEmailRepository {
        async load(email: string): Promise<IAccountModel> {
            return new Promise(resolve => resolve(makeFakeAccount()))
        }
    }
    return new LoadAccountByEmailRepositoryStub()
}

const makeHashComparerStub = (): IHashComparer => {
    class HashComparerStub implements IHashComparer {
        async compare(value: string, hash: string): Promise<boolean> {
            return new Promise(resolve => resolve(true))
        }
    }
    return new HashComparerStub()
}

const makeEncrypterStub = (): IEncrypter => {
    class EncrypterStub implements IEncrypter {
        async encrypt(value: string): Promise<string> {
            return new Promise(resolve => resolve('any_token'))
        }
    }
    return new EncrypterStub()
}

const makeUpdateAccessTokenRepositoryStub = (): IUpdateAccessTokenRepository => {
    class UpdateAccessTokenRepositoryStub implements IUpdateAccessTokenRepository {
        async update(id: string, token: string): Promise<void> {
            return new Promise(resolve => resolve())
        }
    }
    return new UpdateAccessTokenRepositoryStub()
}

const makeSut = () => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
    const hashComparerStub = makeHashComparerStub()
    const encrypterStub = makeEncrypterStub()
    const updateAccessTokenRepositoryStub = makeUpdateAccessTokenRepositoryStub()
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
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load')
        await sut.auth(makeFakeAuthentication())
        expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
    })

    // Garante que DbAuthentication lance uma exceção se o LoadAccountByEmailRepository lançar
    test('Should throw if LoadAccountByEmailRepository throws', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(
            Promise.reject(new Error())
        )
        const promise = sut.auth(makeFakeAuthentication())
        await expect(promise).rejects.toThrow()
    })

    // Garante que DbAuthentication retorne null se o LoadAccountByEmailRepository retornar null
    test('Should return null if LoadAccountByEmailRepository returns null', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        jest.spyOn(loadAccountByEmailRepositoryStub, 'load').mockReturnValueOnce(null)
        const accessToken = await sut.auth(makeFakeAuthentication())
        expect(accessToken).toBeNull()
    })

    // Garante que chame HashComparer com a senha correta
    test('Should call HashComparer with correct values', async () => {
        const { sut, hashComparerStub } = makeSut()
        const compareSpy = jest.spyOn(hashComparerStub, 'compare')
        await sut.auth(makeFakeAuthentication())
        expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password')
    })

    // Garante que DbAuthentication lance uma exceção se o HashComparer lançar
    test('Should throw if HashComparer throws', async () => {
        const { sut, hashComparerStub } = makeSut()
        jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(
            Promise.reject(new Error())
        )
        const promise = sut.auth(makeFakeAuthentication())
        await expect(promise).rejects.toThrow()
    })

    // Garante que DbAuthentication retorne null se o HashComparer retornar false
    test('Should return null if HashComparer returns false', async () => {
        const { sut, hashComparerStub } = makeSut()
        jest.spyOn(hashComparerStub, 'compare').mockReturnValueOnce(Promise.resolve(false))
        const accessToken = await sut.auth(makeFakeAuthentication())
        expect(accessToken).toBeNull()
    })

    // Garante que Encrypter seja chamado com id correto
    test('Should call Encrypter with correct id', async () => {
        const { sut, encrypterStub } = makeSut()
        const generateSpy = jest.spyOn(encrypterStub, 'encrypt')
        await sut.auth(makeFakeAuthentication())
        expect(generateSpy).toHaveBeenCalledWith('any_id')
    })

    // Garante que DbAuthentication lance uma exceção se o Encrypter lançar
    test('Should throw if Encrypter throws', async () => {
        const { sut, encrypterStub } = makeSut()
        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
            Promise.reject(new Error())
        )
        const promise = sut.auth(makeFakeAuthentication())
        await expect(promise).rejects.toThrow()
    })

    // Garante que DbAuthentication retorne um token em caso de sucesso
    test('Should return a token on success', async () => {
        const { sut } = makeSut()
        const accessToken = await sut.auth(makeFakeAuthentication())
        expect(accessToken).toBe('any_token')
    })

    // Garante que chame UpdateAccessTokenRepository com valores corretos
    test('Should call UpdateAccessTokenRepository with correct values', async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut()
        const updateSpy = jest.spyOn(updateAccessTokenRepositoryStub, 'update')
        await sut.auth(makeFakeAuthentication())
        expect(updateSpy).toHaveBeenCalledWith('any_id', 'any_token')
    })

    // Garante que DbAuthentication lance uma exceção se o UpdateAccessTokenRepository lançar
    test('Should throw if UpdateAccessTokenRepository throws', async () => {
        const { sut, updateAccessTokenRepositoryStub } = makeSut()
        jest.spyOn(updateAccessTokenRepositoryStub, 'update').mockReturnValueOnce(
            Promise.reject(new Error())
        )
        const promise = sut.auth(makeFakeAuthentication())
        await expect(promise).rejects.toThrow()
    })
})
