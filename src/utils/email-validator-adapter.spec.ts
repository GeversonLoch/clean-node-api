import { EmailValidatorAdapter } from './email-validator-adapter'
import validator from 'validator'

/*
A biblioteca "validator" é mockada de forma que o método isEmail retorne sempre true.
Isso significa que, por padrão, ao chamar o método isValid do EmailValidatorAdapter (que internamente utiliza
validator.isEmail), o resultado será true, simulando que o email é válido.

Caso seja necessário testar outros cenários (por exemplo, simular um email inválido), podemos sobrescrever
o comportamento do método isValid diretamente nos testes, já que, com o mock, validator.isEmail nunca retorna false.
*/
jest.mock('validator', () => ({
  isEmail(): boolean {
    return true
  }
}))

// sut: System Under Test (Sistema sob teste)
const makeSut = (): EmailValidatorAdapter => {
  return new EmailValidatorAdapter()
}

describe('Email Validator Adapter', () => {

  // Testa se o método isValid retorna false quando é manualmente sobrescrito para esse cenário.
  // Observe que, como o mock do validator.isEmail sempre retorna true, esse teste não depende do comportamento
  // real do validador, mas sim da sobrescrição (mock) aplicada ao próprio método isValid.
  test('Should return false when isValid is forced to return false', () => {
    const sut = makeSut()
    jest.spyOn(sut, 'isValid').mockReturnValueOnce(false)
    const isValid = sut.isValid('invalid_email@email.com')
    expect(isValid).toBe(false)
  })

  // Como o validator.isEmail está mockado para retornar true, o método isValid deverá retornar true para qualquer email.
  test('Should return true when validator returns true', () => {
    const sut = makeSut()
    const isValid = sut.isValid('valid_email@email.com')
    expect(isValid).toBe(true)
  })

  // Verifica se o método isEmail da biblioteca validator é chamado com o email correto passado para isValid.
  test('Should call validator with correct email', () => {
    const sut = makeSut()
    const isEmailSpy = jest.spyOn(validator, 'isEmail')
    sut.isValid('any_email@email.com')
    expect(isEmailSpy).toHaveBeenCalledWith('any_email@email.com')
  })

})
