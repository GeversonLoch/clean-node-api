import { DbAddAccount } from "./db-add-account"
import { IEncrypter } from './db-add-account-protocols'

interface SutTypes {
    sut: DbAddAccount,
    encrypterStub: IEncrypter
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

const makeSut = (): SutTypes => {
    const encrypterStub = makeEncrypter()

    // Cria uma instância da classe DbAddAccount, passando o encrypterStub como argumento
    const sut = new DbAddAccount(encrypterStub)

    return {
        sut,
        encrypterStub
    }
}

// Descreve os testes para a classe DbAddAccount Usecase
describe('DbAddAccount Usecase', () => {

    // Teste para garantir que o método Encrypter seja chamado com a senha correta
    test('Should call Encripter with correct password', () => {

        const { sut, encrypterStub } = makeSut()

        // Cria um espião (spy) no método encrypt do encrypterStub
        const encrypterSpy = jest.spyOn(encrypterStub, 'encrypt')

        // Chama o método add da instância DbAddAccount
        sut.add({
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

        // Cria um espião (spy) no método encrypt do encrypterStub
        jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(Promise.reject(new Error()))

        // Chama o método add da instância DbAddAccount
        const promise = sut.add({
            name: 'valid_name',
            email: 'valid_email',
            password: 'valid_password'
        })

        // Verifica se o método add lançou uma exceção
        await expect(promise).rejects.toThrow()
    })

})