export interface ILoadAnswersBySurvey {
    loadAnswers(id: any): Promise<ILoadAnswersBySurvey.Result>
}

export namespace ILoadAnswersBySurvey {
    export type Result = string[]
}
