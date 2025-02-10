import { DbAddAccount } from "./db-add-account"
import {
    IEncrypter,
    IAddAccountModel,
    IAccountModel,
    IAddAccountRepository
} from './db-add-account-protocols'

interface SutTypes {
    sut: DbAddAccount,
    encrypterStub: IEncrypter
    addAccountRepositoryStub: IAddAccountRepository
}

const makeEncrypter = (): IEncrypter => {

    // Classe fictícia EncrypterStub usada para simular o comportamento da classe Encrypter real
    class EncrypterStub {

        // Método que simula a criptografia e sempre retorna 'hashed_password'
        async encrypt(value: string): Promise<string> {
            return Promise.resolve('hashed_password')
        }
    }
    return new EncrypterStub()
}

const makeAddAccountRepository = (): IAddAccountRepository => {

    // Classe fictícia AddAccountRepositoryStub usada para simular o comportamento da classe AddAccountRepository real
    class AddAccountRepositoryStub {

        // Simula o retorno do método add e sempre retorna dados mock
        async add(account: IAddAccountModel): Promise<IAccountModel> {
            const fakeAccount = {
                id: 'valid_id',
                name: 'valid_name',
                email: 'valid_email',
                password: 'hashed_password'
            };
            return new Promise(resolve => resolve(fakeAccount))
        }
    }
    return new AddAccountRepositoryStub()
}

const makeSut = (): SutTypes => {
    const encrypterStub = makeEncrypter()
    const addAccountRepositoryStub = makeAddAccountRepository()

    // Cria uma instância da classe DbAddAccount, passando o encrypterStub e addAccountRepositoryStub como argumento
    const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub)

    return {
        sut,
        encrypterStub,
        addAccountRepositoryStub,
    }
}

// Descreve os testes para a classe DbAddAccount Usecase
describe('DbAddAccount Usecase', () => {

    // Teste para garantir que o método Encrypter seja chamado com a senha correta
    test('Should call Encripter with correct password', async () => {

        const { sut, encrypterStub } = makeSut()

        // Cria um espião (spy) no método encrypt do encrypterStub
        const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt')

        // Chama o método add da instância DbAddAccount
        await sut.add({
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password'
        })

        // Verifica se o espião encrypterSpy foi chamado com a senha correta ('valid_password')
        expect(encrypterSpy).toHaveBeenCalledWith('valid_password')
    })

    // Teste para garantir que o erro seja tratado na controller
    test('Should throw if Encripter throws', async () => {

        const { sut, encrypterStub } = makeSut()

        // Simula que o método 'encrypt' lance um erro
        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(Promise.reject(new Error()))

        // Chama o método add da instância DbAddAccount
        const account = sut.add({
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password'
        })

        // Verifica se o método add lançou uma exceção
        await expect(account).rejects.toThrow()
    })

    // Teste para garantir que chame AddAccountRepository com os valores corretos
    test('Should call AddAccountRepository with correct values', async () => {

        const { sut, addAccountRepositoryStub } = makeSut()

        // Cria um espião (spy) no método add do addAccountRepositoryStub
        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add')

        // Chama o método add da instância DbAddAccount
        await sut.add({
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password'
        })

        // Verifica se o espião addSpy foi chamado com os valores corretos
        expect(addSpy).toHaveBeenCalledWith({
            name: 'valid_name',
            email: 'valid_email',
            password: 'hashed_password'
        })
    })

    // Teste para garantir que o erro seja tratado na controller
    test('Should throw if AddAccountRepository throws', async () => {

        const { sut, addAccountRepositoryStub } = makeSut()

        // Simula que o método 'add' lance um erro
        jest.spyOn(addAccountRepositoryStub, 'add').mockReturnValueOnce(Promise.reject(new Error()))

        // Chama o método add da instância DbAddAccount
        const account = sut.add({
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password'
        })

        // Verifica se o método add lançou uma exceção
        await expect(account).rejects.toThrow()
    })

    // Teste para garantir que retorne uma conta em caso de sucesso
    test('Should return an account on success', async () => {

        const { sut } = makeSut()

        // Chama o método add da instância DbAddAccount
        const account = await sut.add({
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password'
        })

        // Verifica se o espião addSpy retorna com os valores corretos de sucesso
        expect(account).toEqual({
            id: 'valid_id',
            name: 'valid_name',
            email: 'valid_email',
            password: 'hashed_password'
        })
    })

})