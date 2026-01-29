import { IHttpResponse } from '@presentation/protocols'
import { internalServerError } from '@presentation/helpers'

export const mockInternalServerError = (): IHttpResponse => {
    let fakeError = new Error()
    fakeError.stack = 'any_stack'
    return internalServerError(fakeError)
}
