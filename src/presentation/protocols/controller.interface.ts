import { IHttpResponse } from '@presentation/protocols'

export interface IController<T = any> {
    handle(request: T): Promise<IHttpResponse>
}
