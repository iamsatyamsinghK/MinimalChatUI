export interface ConvoHistoryRequest{
    userId: string;
    before?: Date|null;
    count: number;
    sort: string;
}