export interface groupConvoResponse {
    messageId: number;
    senderId: string;
    receiverIds: string[];
    content: string;
    timestamp: Date;
    chatId: number;
}