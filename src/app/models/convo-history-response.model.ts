export interface ConvoHistoryResponse{
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: Date;
}