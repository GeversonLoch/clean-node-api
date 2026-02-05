import { ILoadAnswersBySurvey } from '@domain/usecases'
import { ILoadAnswersBySurveyRepository } from '@data/protocols'

export class DbLoadAnswersBySurvey implements ILoadAnswersBySurvey {
    constructor(
        private readonly loadAnswersBySurveyRepository: ILoadAnswersBySurveyRepository,
    ) {}

    async loadAnswers(id: string): Promise<ILoadAnswersBySurvey.Result> {
        const survey = await this.loadAnswersBySurveyRepository.loadById(id)
        return survey?.answers.map(a => a.answer) || []
    }
}
