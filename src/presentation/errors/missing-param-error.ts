export class MissingParamError extends Error {
    constructor(paramName: string) {
        super(`⚠️ Parâmetro ausente: ${paramName}`)
        this.name = 'MissingParamError'
    }
}
