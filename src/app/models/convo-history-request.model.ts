export interface ConvoHistoryRequest{
    userId: number;
    before?: Date;
    count: number;
    sort: string;
}