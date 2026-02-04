import { IController, IHttpResponse } from '@presentation/protocols'
import { badRequest, internalServerError, noContent } from '@presentation/helpers'
import { IValidation } from '@presentation/protocols'
import { IAddSurvey } from '@domain/usecases'

export class AddSurveyController implements IController {
    constructor(
        private readonly validation: IValidation,
        private readonly addSurvey: IAddSurvey,
    ) {}

    async handle(request: AddSurveyController.Request): Promise<IHttpResponse> {
        try {
            const error = this.validation.validate(request)
            if (error) {
                return badRequest(error)
            }

            const { question, answers } = request
            await this.addSurvey.add({
                question,
                answers,
                date: new Date(),
            })

            return noContent()
        } catch (error) {
            return internalServerError(error)
        }
    }
}

export namespace AddSurveyController {
    export type Request = {
        question: string
        answers: Answer[]
    }

    type Answer = {
        image?: string
        answer: string
    }
}
