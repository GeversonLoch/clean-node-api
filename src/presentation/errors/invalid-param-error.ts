export class InvalidParamError extends Error {
    constructor(paramName: string) {
        super(`🚩 Parâmetro inválido: ${paramName}`)
        this.name = 'InvalidParamError'
    }
}