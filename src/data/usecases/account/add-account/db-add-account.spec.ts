import { DbAddAccount } from '@data/usecases'
import { IAddAccountRepository, IHasher, ILoadAccountByEmailRepository } from '@data/protocols'
import { IAccountModel } from '@domain/models'
import { mockAddAccountRepository, mockHasher } from '@data/test'
import { mockAccountModel, mockAddAccountParams } from '@domain/test'

interface SutTypes {
    sut: DbAddAccount
    hasherStub: IHasher
    addAccountRepositoryStub: IAddAccountRepository,
    loadAccountByEmailRepositoryStub: ILoadAccountByEmailRepository,
}

const mockLoadAccountByEmailRepository = () => {
    class LoadAccountByEmailRepositoryStub implements ILoadAccountByEmailRepository {
        async loadByEmail(email: string): Promise<IAccountModel> {
            return new Promise(resolve => resolve(null))
        }
    }
    return new LoadAccountByEmailRepositoryStub()
}

const makeSut = (): SutTypes => {
    const hasherStub = mockHasher()
    const addAccountRepositoryStub = mockAddAccountRepository()
    const loadAccountByEmailRepositoryStub = mockLoadAccountByEmailRepository()

    // Cria uma instância da classe DbAddAccount, injetando hasherStub e addAccountRepositoryStub como dependências
    const sut = new DbAddAccount(
        hasherStub,
        addAccountRepositoryStub,
        loadAccountByEmailRepositoryStub,
    )
    return {
        sut,
        hasherStub,
        addAccountRepositoryStub,
        loadAccountByEmailRepositoryStub,
    }
}

// Descreve os testes para a use case DbAddAccount
describe('DbAddAccount Usecase', () => {
    // Teste para garantir que o método hash do Hasher seja chamado com a senha correta
    test('Should call Hasher with correct password', async () => {

        const { sut, hasherStub } = makeSut()

        // Cria um espião (spy) no método hash do hasherStub
        const hasherSpy = jest.spyOn(hasherStub, 'hash')

        // Chama o método add da instância DbAddAccount
        await sut.add(mockAddAccountParams())

        // Verifica se o espião hasherSpy foi chamado com a senha 'any_password'
        expect(hasherSpy).toHaveBeenCalledWith('any_password')
    })

    // Teste para garantir que o DbAddAccount repassa a exceção caso o Hasher lance um erro
    test('Should throw if Hasher throws', async () => {

        const { sut, hasherStub } = makeSut()

        // Simula que o método 'hash' lance um erro
        jest.spyOn(hasherStub, 'hash').mockImplementationOnce(() => { throw new Error() })

        // Chama o método add da instância DbAddAccount e armazena a promise
        const accountPromise = sut.add(mockAddAccountParams())

        // Verifica se o método add repassa a exceção lançada pelo Hasher
        await expect(accountPromise).rejects.toThrow()
    })

    // Teste para garantir que o AddAccountRepository seja chamado com os valores corretos
    test('Should call AddAccountRepository with correct values', async () => {

        const { sut, addAccountRepositoryStub } = makeSut()

        // Cria um espião (spy) no método add do addAccountRepositoryStub
        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')

        // Chama o método add da instância DbAddAccount
        await sut.add(mockAddAccountParams())

        // Verifica se o espião addSpy foi chamado com os valores esperados,
        // sendo que a senha já deve estar criptografada ('hashed_password')
        expect(addSpy).toHaveBeenCalledWith({
            name: 'any_name',
            email: 'any_email@email.com',
            password: 'hashed_password'
        })
    })

    // Teste para garantir que o DbAddAccount repassa a exceção caso o AddAccountRepository lance um erro
    test('Should throw if AddAccountRepository throws', async () => {

        const { sut, addAccountRepositoryStub } = makeSut()

        // Simula que o método 'add' lance um erro
        jest.spyOn(addAccountRepositoryStub, 'add').mockImplementationOnce(() => { throw new Error() })

        // Chama o método add da instância DbAddAccount e armazena a promise
        const accountPromise = sut.add(mockAddAccountParams())

        // Verifica se o método add repassa a exceção lançada pelo AddAccountRepository
        await expect(accountPromise).rejects.toThrow()
    })

    // Teste para garantir que seja retornada uma conta em caso de sucesso
    test('Should return an account on success', async () => {

        const { sut } = makeSut()

        // Chama o método add da instância DbAddAccount e armazena o resultado
        const account = await sut.add(mockAddAccountParams())

        // Verifica se o método add retorna a conta esperada
        expect(account).toEqual(mockAccountModel())
    })

    // Garante que LoadAccountByEmailRepository seja chamado com o email correto
    test('Should call LoadAccountByEmailRepository with correct email', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
        await sut.add(mockAddAccountParams())
        expect(loadSpy).toHaveBeenCalledWith('any_email@email.com')
    })

    // Garante que retorne nulo se LoadAccountByEmailRepository não retornar nulo
    test('Should return null if LoadAccountByEmailRepository not return null', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(
            Promise.resolve(mockAccountModel())
        )
        const account = await sut.add(mockAddAccountParams())
        expect(account).toBeNull()
    })
})
