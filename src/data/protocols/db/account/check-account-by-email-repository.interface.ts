export interface ICheckAccountByEmailRepository {
    checkByEmail(email: string): Promise<boolean>
}
