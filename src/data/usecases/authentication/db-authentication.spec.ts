import { IHashComparer, ILoadAccountByEmailRepository } from '@data/protocols'
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

const makeSut = () => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()
    const hashComparer = makeHashComparerStub()
    const sut = new DbAuthentication(loadAccountByEmailRepositoryStub, hashComparer)
    return {
        sut,
        loadAccountByEmailRepositoryStub,
        hashComparer,
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
        const { sut, hashComparer } = makeSut()
        const compareSpy = jest.spyOn(hashComparer, 'compare')
        await sut.auth(makeFakeAuthentication())
        expect(compareSpy).toHaveBeenCalledWith('any_password', 'hashed_password')
    })

    // Garante que 
    test('Should throw if HashComparer throws', async () => {
        const { sut, hashComparer } = makeSut()
        jest.spyOn(hashComparer, 'compare').mockReturnValueOnce(
            Promise.reject(new Error())
        )
        const promise = sut.auth(makeFakeAuthentication())
        await expect(promise).rejects.toThrow()
    })
})
