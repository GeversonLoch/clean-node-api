export interface ILoadAnswersBySurveyRepository {
    loadAnswers(id: string): Promise<string[]>
}
