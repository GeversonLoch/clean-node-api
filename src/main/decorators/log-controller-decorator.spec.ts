import { IController, IHttpRequest, IHttpResponse } from "@presentation/protocols"
import { LogControllerDecorator } from "./log-controller-decorator"
import { internalServerError, success } from "@presentation/helpers"
import { ILogErrorRepository } from "@data/protocols"
import { IAccountModel } from "@domain/models"

class ControllerStub implements IController {
    async handle(httpRequest: IHttpRequest): Promise<IHttpResponse> {
        return new Promise(resolve => resolve(success(makeFakeAccount())))
    }
}

class LogErrorRepositoryStub implements ILogErrorRepository {
    async log(stack: string): Promise<void> {
        return new Promise(resolve => resolve())
    }
}

const makeFakeRequest = (): IHttpRequest => ({
    body: {
        name: 'any_name',
        email: 'any_email@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
    }
})

const makeFakeAccount = (): IAccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_email@email.com',
  password: 'valid_password'
})

const makeFakeServerError = (): IHttpResponse => {
    let fakeError = new Error()
    fakeError.stack = 'any_stack'
    return internalServerError(fakeError)
}

const makeSut = () => {
    const controllerStub = new ControllerStub()
    const logErrorRepositoryStub = new LogErrorRepositoryStub();
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
        sut.handle(makeFakeRequest())
        expect(handleSpy).toHaveBeenCalledWith(makeFakeRequest())
    })

    // Garante que o método handle do controller retorne o valor correto
    test('Should return the same result of the controller', async () => {
        const { sut } = makeSut()
        const httpResponse = await sut.handle(makeFakeRequest())
        expect(httpResponse).toEqual(success(makeFakeAccount()))
    })

    // Garante que o LogErrorRepository seja chamado com o erro correto se o controlador retornar um erro do servidor
    test('Should call LogErrorRepository with correct error if controller returns a server error', async () => {
        const { sut, controllerStub, logErrorRepositoryStub } = makeSut()

        // Observando o método log do LogErrorRepositoryStub para verificar se ele é chamado com o erro correto
        const logSpy = jest.spyOn(logErrorRepositoryStub, 'log')

        // Mockando o retorno do método handle do controllerStub para retornar um erro
        jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => resolve(makeFakeServerError())))

        await sut.handle(makeFakeRequest())
        expect(logSpy).toHaveBeenCalledWith('any_stack')
    })
})
