import jwt from 'jsonwebtoken'
import { IDecrypter, IEncrypter } from '@data/protocols'

export class JwtAdapter implements IEncrypter, IDecrypter {
    constructor(private readonly secret: string) {}

    async encrypt(value: string): Promise<string> {
        const accessToken = await jwt.sign({ id: value }, this.secret)
        return accessToken
    }

    async decrypt(token: string): Promise<jwt.JwtPayload | string> {
        const decodedToken: jwt.JwtPayload | string = await jwt.verify(token, this.secret)
        return decodedToken
    }
}
