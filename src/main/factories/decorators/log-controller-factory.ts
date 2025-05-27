import { LogMongoRepository } from '@infrastructure/db'
import { mongoDBAdapter } from '@main/config/db-connection'
import { IController } from '@presentation/protocols'
import { LogControllerDecorator } from '@main/decorators/log/log-controller-decorator'

export const makeLogControllerDecorator = (controller: IController): IController => {
    const logErrorRepository = new LogMongoRepository(mongoDBAdapter)
    return new LogControllerDecorator(controller, logErrorRepository)
}
