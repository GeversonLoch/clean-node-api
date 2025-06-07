export class AccessDeniedError extends Error {
    constructor() {
        super('⛔ Acesso negado!')
        this.name = 'AccessDeniedError'
    }
}