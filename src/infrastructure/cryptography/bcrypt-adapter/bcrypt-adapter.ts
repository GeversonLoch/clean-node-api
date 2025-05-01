import bcrypt from "bcrypt"
import { IHashComparer, IHasher } from "@data/protocols"

export class BcryptAdapter implements IHasher, IHashComparer {
    constructor(private readonly salt: number) {}

    async hash (value: string): Promise<string> {
        const hashedValue = await bcrypt.hash(value, this.salt)
        return hashedValue
    }

    async compare(value: string, hash: string): Promise<boolean> {
        const isValid = await bcrypt.compare(value, hash)
        return isValid
    }
}