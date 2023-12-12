export class IMissingParamError extends Error {
    constructor(paramName: string) {
        super(`Missing param: ${paramName}`)
        this.name = 'MissingParamError'
    }
}