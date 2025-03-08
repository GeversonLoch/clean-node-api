export interface IDatabaseAdapter {
    connect(): Promise<void>
    disconnect(): Promise<void>
}
