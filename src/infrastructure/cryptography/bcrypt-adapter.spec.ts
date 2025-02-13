import bcrypt from 'bcrypt'
import { BcryptAdapter } from './bcrypt-adapter'

/*
A biblioteca "bcrypt" foi mockada de forma que o método 'hash' retorne sempre 'any_hashed_value'.
Isso significa que, ao chamar o método 'encrypt' do BcryptAdapter (que internamente utiliza bcrypt.hash),
o resultado será sempre 'any_hashed_value', simulando o retorno de um hash válido.

Caso seja necessário testar outros cenários (por exemplo, simular um hash inválido), podemos sobrescrever
o comportamento do método 'hash' diretamente nos testes, uma vez que, com o mock, bcrypt.hash sempre retorna 'any_hashed_value'.
*/
jest.mock('bcrypt', () => ({
  async hash(): Promise<string> {
    return new Promise(resolve => resolve('any_hashed_value'))
  }
}))

const salt = 12

const makeSut = (): BcryptAdapter => {
  const sut = new BcryptAdapter(salt)
  return sut
}

describe('Bcrypt Adapter', () => {

  // Garante que o BcryptAdapter chame o método bcrypt.hash com os valores corretos (valor e salt)
  test('Should call Bcrypt with correct values', async () => {
    const sut = makeSut()
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    await sut.encrypt('any_value')
    expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
  })

  // Garante que o BcryptAdapter retorne um hash quando o processo de criptografia for bem-sucedido
  test('Should return a hash on success', async () => {
    const sut = makeSut()
    const hashedValue = await sut.encrypt('any_value')
    expect(hashedValue).toBe('any_hashed_value')
  })

})
