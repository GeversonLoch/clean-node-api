export interface ICheckSurveyByIdRepository {
    checkById(id: string): Promise<boolean>
}
