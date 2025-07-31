import jwt from 'jsonwebtoken'
import { JwtAdapter } from '@infrastructure/cryptography'

jest.mock('jsonwebtoken', () => ({
    async sign(): Promise<string> {
        return Promise.resolve('any_token')
    },
    async verify(): Promise<string> {
        return Promise.resolve('any_value')
    },
}))

const makeSut = (): JwtAdapter => {
    return new JwtAdapter('secret')
}

describe('JWT Adapter', () => {
    describe('sign()', () => {
        // Garante que o JwtAdapter chame o método sign com os valores corretos
        test('Should call sign with coorrect values', async () => {
            const sut = makeSut()
            const signSpy = jest.spyOn(jwt, 'sign')
            await sut.encrypt('any_id')
            expect(signSpy).toHaveBeenCalledWith({ id: 'any_id' }, 'secret')
        })

        // Garante que o JwtAdapter retorne um token quando o método sign for bem-sucedido
        test('Should return a token on sign success', async () => {
            const sut = makeSut()
            const accessToken = await sut.encrypt('any_id')
            expect(accessToken).toBe('any_token')
        })

        // Garante que o JwtAdapter lance uma exceção se o método sign lançar
        test('Should throw if sign throws', async () => {
            const sut = makeSut()
            jest.spyOn(jwt, 'sign').mockImplementationOnce(() => {
                throw new Error()
            })
            const promise = sut.encrypt('any_id')
            await expect(promise).rejects.toThrow()
        })
    })

    describe('decrypt()', () => {
        // Garante que o JwtAdapter chame o método decrypt com os valores corretos.
        test('Should call decrypt with coorrect values', async () => {
            const sut = makeSut()
            const verifySpy = jest.spyOn(jwt, 'verify')
            await sut.decrypt('any_token')
            expect(verifySpy).toHaveBeenCalledWith('any_token', 'secret')
        })

        // Garante que o JwtAdapter retorne um valor quando o método verify for bem-sucedido
        test('Should return a value on verify success', async () => {
            const sut = makeSut()
            const value = await sut.decrypt('any_token')
            expect(value).toBe('any_value')
        })

        // Garante que o JwtAdapter lance uma exceção se o método verify lançar
        test('Should throw if verify throws', async () => {
            const sut = makeSut()
            jest.spyOn(jwt, 'verify').mockImplementationOnce(() => {
                throw new Error()
            })
            const promise = sut.decrypt('any_token')
            await expect(promise).rejects.toThrow()
        })
    })
})
