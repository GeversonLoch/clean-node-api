import { IDecrypter } from '@data/protocols'
import { DbLoadAccountByToken } from '@data/usecases'

const accessToken = 'any_token'
const role = 'any_role'
const decryptToken = 'any_decrypted_value'

const makeDecrypterStub = (): IDecrypter => {
    class Decrypter implements IDecrypter {
        async decrypt(value: string): Promise<string> {
            return Promise.resolve(decryptToken)
        }
    }
    return new Decrypter()
}

const makeSut = () => {
    const decrypterStub = makeDecrypterStub()
    const sut = new DbLoadAccountByToken(decrypterStub)
    return {
        sut,
        decrypterStub,
    }
}

describe('DbLoadAccountByToken Usecase', () => {
    // Garrante que Decrypter seja chamado com os valores corretos.
    test('Shoud call Decrypter with correct values', async () => {
        const { sut, decrypterStub } = makeSut()
        const decryptSpy = jest.spyOn(decrypterStub, 'decrypt')
        await sut.loadByToken(accessToken, role)
        expect(decryptSpy).toHaveBeenCalledWith(accessToken)
    })

    // Garrante que DbLoadAccountByToken retorne nulo se Decrypter retornar nulo.
    test('Shoud return null if Decrypter returns null', async () => {
        const { sut, decrypterStub } = makeSut()
        jest.spyOn(decrypterStub, 'decrypt').mockReturnValueOnce(Promise.resolve(null))
        const account = await sut.loadByToken(accessToken, role)
        expect(account).toBeNull()
    })
})
