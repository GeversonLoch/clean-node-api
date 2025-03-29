import { MissingParamError } from "@presentation/errors";
import { badRequest } from "@presentation/helpers";
import { IController, IHttpRequest, IHttpResponse } from "@presentation/protocols";

export class LoginController implements IController {
    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        return new Promise(resolve => resolve(
            badRequest(new MissingParamError('email'))
        ))
    }
}
