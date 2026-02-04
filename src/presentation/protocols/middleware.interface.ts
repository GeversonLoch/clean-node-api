import { IHttpResponse } from '@presentation/protocols'

export interface IMiddleware<T = any> {
    handle(request: T): Promise<IHttpResponse>
}
