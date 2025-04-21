import { ILoadAccountByEmailRepository } from '@data/protocols'
import { DbAuthentication } from '@data/usecases'
import { IAccountModel } from '@domain/models'

const makeLoadAccountByEmailRepositoryStub = () => {
    class LoadAccountByEmailRepositoryStub implements ILoadAccountByEmailRepository {
        async load(email: string): Promise<IAccountModel> {
            const fakeAccount = {
                id: 'any_id',
                name: 'any_name',
                email: 'any_email@mail.com',
                password: 'any_password',
            }
            return new Promise(resolve => resolve(fakeAccount))
        }
    }
    return new LoadAccountByEmailRepositoryStub()
}

const makeSut = () => {
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepositoryStub()
    const sut = new DbAuthentication(loadAccountByEmailRepositoryStub)
    return {
        sut,
        loadAccountByEmailRepositoryStub,
    }
}

describe('DbAuthentication Usecase', () => {
    // Garante que LoadAccountByEmailRepository seja chamado com o email correto
    test('Should call LoadAccountByEmailRepository with correct email', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'load')
        await sut.auth({
            email: 'any_email@mail.com',
            password: 'any_password',
        })
        expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
    })
})
