export interface groupConvoRequest {
    chatId: number;
    before?: Date|null;
    count: number;
    sort: string;
}