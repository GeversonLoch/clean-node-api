import { DbAddAccount } from "./db-add-account"

// Descreve os testes para a classe DbAddAccount Usecase
describe('DbAddAccount Usecase', () => {

    // Classe fictícia EncrypterStub usada para simular o comportamento da classe Encrypter real
    class EncrypterStub {

        // Método que simula a criptografia e sempre retorna 'hashed_password'
        async encrypt(value: string): Promise<string> {
            return Promise.resolve('hashed_password')
        }
    }

    // Teste para garantir que o método Encrypter seja chamado com a senha correta
    test('Should call Encripter with correct password', () => {

        // Cria uma instância da classe EncrypterStub, usada para simular o comportamento da classe Encrypter real
        const encrypterStub = new EncrypterStub()

        // Cria uma instância da classe DbAddAccount, passando o encrypterStub como argumento
        const sut = new DbAddAccount(encrypterStub)

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
})