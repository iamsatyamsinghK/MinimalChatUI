export interface SendMessageResponse{
    messageId: number;
    senderId: number;
    receiverId: number;
    content: string;
    timeStamp: Date;
}