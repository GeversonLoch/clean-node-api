import { IDecrypter, IEncrypter, IHashComparer, IHasher } from '@data/protocols'

export const mockHasher = (): IHasher => {
    class HasherStub {
        async hash(value: string): Promise<string> {
            return Promise.resolve('hashed_password')
        }
    }
    return new HasherStub()
}

export const mockHashComparer = (): IHashComparer => {
    class HashComparerStub implements IHashComparer {
        async compare(value: string, hash: string): Promise<boolean> {
            return Promise.resolve(true)
        }
    }
    return new HashComparerStub()
}

export const mockEncrypter = (): IEncrypter => {
    class EncrypterStub implements IEncrypter {
        async encrypt(value: string): Promise<string> {
            return Promise.resolve('any_token')
        }
    }
    return new EncrypterStub()
}

export const mockDecrypter = (): IDecrypter => {
    class DecrypterStub implements IDecrypter {
        async decrypt(value: string): Promise<string> {
            return Promise.resolve('any_decrypted_value')
        }
    }
    return new DecrypterStub()
}
