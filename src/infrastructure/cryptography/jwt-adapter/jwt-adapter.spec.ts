import jwt from 'jsonwebtoken'
import { JwtAdapter } from "@infrastructure/cryptography"

jest.mock('jsonwebtoken', () => ({
    sign: async (): Promise<string> => {
        return new Promise(resolve => resolve('any_token'))
    }
}))

const secret = 'secret'

const makeSut = () => {
    const sut = new JwtAdapter(secret)
    return {
        sut,
    }
}

describe('JWT Adapter', () => {
    // Garante que o JwtAdapter chame o método sign com os valores corretos
    test('Should call sign with coorrect values', async () => {
        const { sut } = makeSut()
        const signSpy = jest.spyOn(jwt, 'sign')
        await sut.encrypt('any_id')
        expect(signSpy).toHaveBeenCalledWith({ id: 'any_id' }, secret)
    })

    // Garante que o JwtAdapter retorne um token quando o método sign for bem-sucedido
    test('Should return a token on sign success', async () => {
        const { sut } = makeSut()
        const accessToken = await sut.encrypt('any_id')
        expect(accessToken).toBe('any_token')
    })

    // Garante que o JwtAdapter lance uma exceção se o método sign lançar
    test('Should throw if sign throws', async () => {
        const { sut } = makeSut()
        jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
            throw new Error()
        })
        const promise = sut.encrypt('any_id')
        await expect(promise).rejects.toThrow()
    })
})
