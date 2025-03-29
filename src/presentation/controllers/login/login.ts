import { MissingParamError } from "@presentation/errors";
import { badRequest } from "@presentation/helpers";
import { IController, IHttpRequest, IHttpResponse } from "@presentation/protocols";

export class LoginController implements IController {
    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const requiredFields = ['email', 'password']
        const { email, password } = httpRequest.body

        for (const fild of requiredFields) {
            if (!httpRequest.body[fild]) {
                return badRequest(new MissingParamError(fild))
            }
        }
    }
}
