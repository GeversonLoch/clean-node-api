import { EmailValidatorAdapter } from './email-validator'
import validator from 'validator'

/*
Ao mockar o retorno do método isEmail, podemos definir manualmente se ele deve retornar true ou false,
dependendo do cenário de teste que estamos simulando.
Isso nos permite testar diferentes caminhos de execução do código que utiliza o método isEmail,
sem depender do comportamento real da biblioteca validator.

Em resumo, o mock do retorno do método isEmail permite que tenhamos controle total sobre o comportamento desse método durante os testes,
facilitando a criação de cenários de teste específicos e garantindo a confiabilidade dos testes unitários.

Por padrão o retorno mockado deve ser sempre verdadeiro.
*/
jest.mock('validator', () => ({
    isEmail(): boolean {
        return true
    }
}))

// sut: System Under Test
const makeSut = () => {
    const sut = new EmailValidatorAdapter()
    return {
      sut
    }
}

describe('Email Validator Adapter', () => {

    // Deve retornar falso se o validador retornar falso
    test('Should return false if validator returns false', () => {
        const { sut } = makeSut()
        jest.spyOn(sut, 'isValid').mockReturnValueOnce(false)
        const isValid = sut.isValid('invalid_email@email.com')

        expect(isValid).toBe(false)
    })

    // Deve retornar verdadeiro se o validador retornar verdadeiro
    test('Should return true if validator returns true', () => {
        const { sut } = makeSut()
        const isValid = sut.isValid('valid_email@email.com')

        expect(isValid).toBe(true)
    })

    // Garantir que o validador seja chamado com o email correto
    test('Should call validator with correct email', () => {
        const { sut } = makeSut()
        const isEmailSpy = jest.spyOn(validator, 'isEmail')
        sut.isValid('any_email@email.com');
        expect(isEmailSpy).toHaveBeenCalledWith('any_email@email.com')
    })

})