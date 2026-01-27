import { DbAddAccount } from "@data/usecases"
import { IAddAccountRepository, IHasher, ILoadAccountByEmailRepository } from "@data/protocols"
import { IAccountModel, IAddAccountModel } from "@domain/models"

interface SutTypes {
    sut: DbAddAccount
    hasherStub: IHasher
    addAccountRepositoryStub: IAddAccountRepository,
    loadAccountByEmailRepositoryStub: ILoadAccountByEmailRepository,
}

const makeFakeAccount = (): IAccountModel => ({
    id: 'any_id',
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'hashed_password'
})

const makeFakeAccountData = (): IAddAccountModel => ({
    name: 'any_name',
    email: 'any_email@mail.com',
    password: 'any_password'
})

const makeHasher = (): IHasher => {
    // Classe fictícia HasherStub usada para simular o comportamento da classe real Hasher
    class HasherStub {
        // Método que simula a criptografia e sempre retorna 'hashed_password'
        async hash(value: string): Promise<string> {
            return Promise.resolve('hashed_password')
        }
    }
    return new HasherStub()
}

const makeAddAccountRepository = (): IAddAccountRepository => {
    // Classe fictícia AddAccountRepositoryStub usada para simular o comportamento da classe real AddAccountRepository
    class AddAccountRepositoryStub implements IAddAccountRepository {
        // Simula o retorno do método add e sempre retorna uma conta mock
        async add(account: IAddAccountModel): Promise<IAccountModel> {
            return new Promise(resolve => resolve(makeFakeAccount()))
        }
    }
    return new AddAccountRepositoryStub()
}

const makeLoadAccountByEmailRepository = () => {
    class LoadAccountByEmailRepositoryStub implements ILoadAccountByEmailRepository {
        async loadByEmail(email: string): Promise<IAccountModel> {
            return new Promise(resolve => resolve(null))
        }
    }
    return new LoadAccountByEmailRepositoryStub()
}

const makeSut = (): SutTypes => {
    const hasherStub = makeHasher()
    const addAccountRepositoryStub = makeAddAccountRepository()
    const loadAccountByEmailRepositoryStub = makeLoadAccountByEmailRepository()

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
        await sut.add(makeFakeAccountData())

        // Verifica se o espião hasherSpy foi chamado com a senha 'any_password'
        expect(hasherSpy).toHaveBeenCalledWith('any_password')
    })

    // Teste para garantir que o DbAddAccount repassa a exceção caso o Hasher lance um erro
    test('Should throw if Hasher throws', async () => {

        const { sut, hasherStub } = makeSut()

        // Simula que o método 'hash' lance um erro
        jest.spyOn(hasherStub, 'hash').mockReturnValueOnce(Promise.reject(new Error()))

        // Chama o método add da instância DbAddAccount e armazena a promise
        const accountPromise = sut.add(makeFakeAccountData())

        // Verifica se o método add repassa a exceção lançada pelo Hasher
        await expect(accountPromise).rejects.toThrow()
    })

    // Teste para garantir que o AddAccountRepository seja chamado com os valores corretos
    test('Should call AddAccountRepository with correct values', async () => {

        const { sut, addAccountRepositoryStub } = makeSut()

        // Cria um espião (spy) no método add do addAccountRepositoryStub
        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')

        // Chama o método add da instância DbAddAccount
        await sut.add(makeFakeAccountData())

        // Verifica se o espião addSpy foi chamado com os valores esperados,
        // sendo que a senha já deve estar criptografada ('hashed_password')
        expect(addSpy).toHaveBeenCalledWith({
            name: 'any_name',
            email: 'any_email@mail.com',
            password: 'hashed_password'
        })
    })

    // Teste para garantir que o DbAddAccount repassa a exceção caso o AddAccountRepository lance um erro
    test('Should throw if AddAccountRepository throws', async () => {

        const { sut, addAccountRepositoryStub } = makeSut()

        // Simula que o método 'add' lance um erro
        jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))

        // Chama o método add da instância DbAddAccount e armazena a promise
        const accountPromise = sut.add(makeFakeAccountData())

        // Verifica se o método add repassa a exceção lançada pelo AddAccountRepository
        await expect(accountPromise).rejects.toThrow()
    })

    // Teste para garantir que seja retornada uma conta em caso de sucesso
    test('Should return an account on success', async () => {

        const { sut } = makeSut()

        // Chama o método add da instância DbAddAccount e armazena o resultado
        const account = await sut.add(makeFakeAccountData())

        // Verifica se o método add retorna a conta esperada
        expect(account).toEqual(makeFakeAccount())
    })

    // Garante que LoadAccountByEmailRepository seja chamado com o email correto
    test('Should call LoadAccountByEmailRepository with correct email', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        const loadSpy = jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail')
        await sut.add(makeFakeAccountData())
        expect(loadSpy).toHaveBeenCalledWith('any_email@mail.com')
    })

    // Garante que retorne nulo se LoadAccountByEmailRepository não retornar nulo
    test('Should return null if LoadAccountByEmailRepository not return null', async () => {
        const { sut, loadAccountByEmailRepositoryStub } = makeSut()
        jest.spyOn(loadAccountByEmailRepositoryStub, 'loadByEmail').mockReturnValueOnce(
            Promise.resolve(makeFakeAccount())
        )
        const account = await sut.add(makeFakeAccountData())
        expect(account).toBeNull()
    })
})
