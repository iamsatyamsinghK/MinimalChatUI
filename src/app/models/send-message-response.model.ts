export interface SendMessageResponse{
    messageId: number;
    senderId: string;
    receiverId: string;
    content: string;
    timeStamp: Date;
}