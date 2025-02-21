import bcrypt from 'bcrypt'
import { IEncrypter } from '../../data/protocols/encrypter.interface'

export class BcryptAdapter implements IEncrypter {
    private readonly salt: number

    constructor(salt: number) {
        this.salt = salt
    }

    async encrypt (value: string): Promise<string> {
        const hashedValue = await bcrypt.hash(value, this.salt)
        return hashedValue
    }
}