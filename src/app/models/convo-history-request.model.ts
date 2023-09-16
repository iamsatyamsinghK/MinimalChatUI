export interface ConvoHistoryRequest{
    userId: number;
    before?: Date|null;
    count: number;
    sort: string;
}