import { IController, IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { LogControllerDecorator } from "./log-controller-decorator"

class ControllerStub implements IController {
    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        const httpResponse = {
            statusCode: 200,
            body: httpRequest.body
        }
        return new Promise(resolve => resolve(httpResponse))
    }
}

const makeSut = () => {
    const controllerStub = new ControllerStub()
    const sut = new LogControllerDecorator(controllerStub)
    return {
        sut,
        controllerStub,
    }
}

describe('Log Controller Decorator', () => {
    // Garante que o método handle do controller seja chamado corretamente
    test('Should call controller handle', async () => {
        const { sut, controllerStub } = makeSut()
        const handleSpy = jest.spyOn(controllerStub, 'handle')
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        sut.handle(httpRequest)
        expect(handleSpy).toHaveBeenCalledWith(httpRequest)
    })

    // Garante que o método handle do controller retorne o valor correto
    test('Should return the same result of the controller', async () => {
        const { sut } = makeSut()
        const httpRequest = {
            body: {
                name: 'any_name',
                email: 'any_email@email.com',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        }
        const httpResponse = await sut.handle(httpRequest)
        expect(httpResponse).toEqual({
            statusCode: 200,
            body: httpRequest.body
        })
    })
})
