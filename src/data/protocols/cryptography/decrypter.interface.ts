import jwt from 'jsonwebtoken'

export interface IDecrypter {
    decrypt(value: string): Promise<jwt.JwtPayload | string>
}
