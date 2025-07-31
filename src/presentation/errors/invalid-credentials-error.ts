export class InvalidCredentialsError extends Error {
    constructor() {
        super('🔒 E-mail ou senha inválidos!')
        this.name = 'InvalidCredentialsError'
    }
}