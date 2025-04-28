import bcrypt from "bcrypt"
import { BcryptAdapter } from "@infrastructure/cryptography"

/*
A biblioteca "bcrypt" foi mockada de forma que o método 'hash' retorne sempre 'any_hashed_value'.
Isso significa que, ao chamar o método 'hash' do BcryptAdapter (que internamente utiliza bcrypt.hash),
o resultado será sempre 'any_hashed_value', simulando o retorno de um hash válido.

Caso seja necessário testar outros cenários (por exemplo, simular que o método lança uma exceção),
podemos sobrescrever o comportamento do método 'hash' diretamente nos testes, já que o mock faz com que
bcrypt.hash retorne sempre 'any_hashed_value' por padrão.
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
  test('Should call hash with correct values', async () => {
    const sut = makeSut()
    const hashSpy = jest.spyOn(bcrypt, 'hash')
    await sut.hash('any_value')
    expect(hashSpy).toHaveBeenCalledWith('any_value', salt)
  })

  // Garante que o BcryptAdapter retorne um hash valido quando o processo de criptografia for bem-sucedido
  test('Should return a valid hash on hash success', async () => {
    const sut = makeSut()
    const hashedValue = await sut.hash('any_value')
    expect(hashedValue).toBe('any_hashed_value')
  })

  // Garante que a exceção lançada pelo bcrypt seja repassada pelo BcryptAdapter para o chamador
  test('Should throw if bcrypt throws', async () => {
    const sut = makeSut()
    const hashSpy = jest.spyOn(bcrypt, 'hash') as jest.Mock
    hashSpy.mockRejectedValueOnce(new Error())
    const promise = sut.hash('any_value')
    await expect(promise).rejects.toThrow()
  })

})
