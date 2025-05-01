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
    // Garantir que o JwtAdapter chame o método sign com os valores corretos
    test('Should call sign with coorrect values', async () => {
        const { sut } = makeSut()
        const signSpy = jest.spyOn(jwt, 'sign')
        await sut.encrypt('any_value')
        expect(signSpy).toHaveBeenCalledWith({ id: 'any_value' }, secret)
    })
})
