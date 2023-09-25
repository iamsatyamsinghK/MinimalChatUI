export interface ConvoHistoryResponse{
    id: number;
    senderId: string;
    receiverId: string;
    content: string;
    timestamp: Date;
}