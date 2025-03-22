import { DbAddAccount } from "@data/usecases"
import { IAddAccountRepository, IEncrypter } from "@data/protocols"
import { IAccountModel, IAddAccountModel } from "@domain/models"

interface SutTypes {
    sut: DbAddAccount
    encrypterStub: IEncrypter
    addAccountRepositoryStub: IAddAccountRepository
}

const makeFakeAccount = (): IAccountModel => ({
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_email',
    password: 'hashed_password'
})

const makeFakeAccountData = (): IAddAccountModel => ({
    name: 'valid_name',
    email: 'valid_email',
    password: 'valid_password'
})

const makeEncrypter = (): IEncrypter => {
    // Classe fictícia EncrypterStub usada para simular o comportamento da classe real Encrypter
    class EncrypterStub {
        // Método que simula a criptografia e sempre retorna 'hashed_password'
        async encrypt(value: string): Promise<string> {
            return Promise.resolve('hashed_password')
        }
    }
    return new EncrypterStub()
}

const makeAddAccountRepository = (): IAddAccountRepository => {
    // Classe fictícia AddAccountRepositoryStub usada para simular o comportamento da classe real AddAccountRepository
    class AddAccountRepositoryStub {
        // Simula o retorno do método add e sempre retorna uma conta mock
        async add(account: IAddAccountModel): Promise<IAccountModel> {
            return new Promise(resolve => resolve(makeFakeAccount()))
        }
    }
    return new AddAccountRepositoryStub()
}

const makeSut = (): SutTypes => {
    const encrypterStub = makeEncrypter()
    const addAccountRepositoryStub = makeAddAccountRepository()

    // Cria uma instância da classe DbAddAccount, injetando encrypterStub e addAccountRepositoryStub como dependências
    const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub)
    return {
        sut,
        encrypterStub,
        addAccountRepositoryStub,
    }
}

// Descreve os testes para a use case DbAddAccount
describe('DbAddAccount Usecase', () => {
    // Teste para garantir que o método encrypt do Encrypter seja chamado com a senha correta
    test('Should call Encrypter with correct password', async () => {

        const { sut, encrypterStub } = makeSut()

        // Cria um espião (spy) no método encrypt do encrypterStub
        const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt')

        // Chama o método add da instância DbAddAccount
        await sut.add(makeFakeAccountData())

        // Verifica se o espião encrypterSpy foi chamado com a senha 'valid_password'
        expect(encrypterSpy).toHaveBeenCalledWith('valid_password')
    })

    // Teste para garantir que o DbAddAccount repassa a exceção caso o Encrypter lance um erro
    test('Should throw if Encrypter throws', async () => {

        const { sut, encrypterStub } = makeSut()

        // Simula que o método 'encrypt' lance um erro
        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(Promise.reject(new Error()))

        // Chama o método add da instância DbAddAccount e armazena a promise
        const accountPromise = sut.add(makeFakeAccountData())

        // Verifica se o método add repassa a exceção lançada pelo Encrypter
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
            name: 'valid_name',
            email: 'valid_email',
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
})
