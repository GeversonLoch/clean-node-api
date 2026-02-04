import { IController, IHttpResponse } from "@presentation/protocols"
import { LogControllerDecorator } from "./log-controller-decorator"
import { success } from "@presentation/helpers"
import { mockInternalServerError } from "@presentation/test"
import { mockAccountModel } from "@domain/test"
import { mockLogErrorRepository } from "@data/test"

const mockController = (): IController => {
    class ControllerStub implements IController {
        async handle(request: any): Promise<IHttpResponse> {
            return Promise.resolve(success(mockAccountModel()))
        }
    }
    return new ControllerStub()
}

const mockRequest = () => ({
    name: 'any_name',
    email: 'any_email@email.com',
    password: 'any_password',
    passwordConfirmation: 'any_password'
})

const makeSut = () => {
    const controllerStub = mockController()
    const logErrorRepositoryStub = mockLogErrorRepository();
    const sut = new LogControllerDecorator(controllerStub, logErrorRepositoryStub)
    return {
        sut,
        controllerStub,
        logErrorRepositoryStub,
    }
}

describe('Log Controller Decorator', () => {
    // Garante que o método handle do controller seja chamado corretamente
    test('Should call controller handle', async () => {
        const { sut, controllerStub } = makeSut()
        const handleSpy = jest.spyOn(controllerStub, 'handle')
        sut.handle(mockRequest())
        expect(handleSpy).toHaveBeenCalledWith(mockRequest())
    })

    // Garante que o método handle do controller retorne o valor correto
    test('Should return the same result of the controller', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(mockRequest())
        expect(httpResponse).toEqual(success(mockAccountModel()))
    })

    // Garante que o LogErrorRepository seja chamado com o erro correto se o controlador retornar um erro do servidor
    test('Should call LogErrorRepository with correct error if controller returns a server error', async () => {
        const { sut, controllerStub, logErrorRepositoryStub } = makeSut()

        // Observando o método log do LogErrorRepositoryStub para verificar se ele é chamado com o erro correto
        const logSpy = jest.spyOn(logErrorRepositoryStub, 'logError')

        // Mockando o retorno do método handle do controllerStub para retornar um erro
        jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(Promise.resolve(mockInternalServerError()))

        await sut.handle(mockRequest())
        expect(logSpy).toHaveBeenCalledWith('any_stack')
    })
})
