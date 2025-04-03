export interface IAuthenticator {
    auth(email: string, password: string): Promise<string>
}