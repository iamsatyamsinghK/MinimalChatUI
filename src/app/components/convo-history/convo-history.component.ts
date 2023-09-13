import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConvoHistoryRequest } from 'src/app/models/convo-history-request.model';
import { ConvoHistoryResponse } from 'src/app/models/convo-history-response.model';
import { EditMessageRequest } from 'src/app/models/edit-message-request.model';
import { SendMessageRequest } from 'src/app/models/send-message-request.model';
import { SendMessageResponse } from 'src/app/models/send-message-response.model';
import { UserProfile } from 'src/app/models/user-profile.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-convo-history',
  templateUrl: './convo-history.component.html',
  styleUrls: ['./convo-history.component.css']
})
export class ConvoHistoryComponent implements OnInit, OnDestroy, OnChanges {

  user?: UserProfile;

  editingIndex: number | null = null;

  convoHistory: ConvoHistoryResponse[] = [];


  message?: SendMessageResponse;

  receiverId: string | null | undefined;

  paramsSubscription?: Subscription;

  model: ConvoHistoryRequest;

  modelSend: SendMessageRequest;

  modelEdit: EditMessageRequest

  constructor(private authService: AuthService, private route: ActivatedRoute){
    this.model ={
      userId: 0,
      before: new Date(),
      count: 5000,
      sort: 'asc'
    };
    this.modelSend ={
      receiverId: 0,
      content:''
    };
    this.modelEdit ={
      messageId: 0,
      content:''
    };
  }
  
  ngOnInit(): void {

    this.authService.user().subscribe({
      next:(response)=> {
        this.user = response;
      }
    });

    this.user = this.authService.getUser();
    
    this.route.paramMap.subscribe({
      next: (params)=> {
        this.receiverId =  params.get('id');
        if (this.receiverId !== null) {
          this.model.userId = parseInt(this.receiverId, 10);
          this.modelSend.receiverId = parseInt(this.receiverId, 10);
          
          this.getConvoHistory();
        }
      }
    });
  }
  
  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // Check if the 'receiverId' property has changed
    if (changes['receiverId'] && !changes['receiverId'].firstChange) {
      // 'changes['receiverId'].currentValue' contains the new 'receiverId' value
      const newReceiverId = changes['receiverId'].currentValue;
  
      // Update the 'model.userId' with the new 'receiverId' value
      this.model.userId = parseInt(newReceiverId, 10);
  
      // Call the API to get updated messages
      this.getConvoHistory(); 
    }
  }

  private getConvoHistory() {
    this.authService.getConvoHistory(this.model).subscribe({
        next: (response) => {
          this.convoHistory = response; 
        }
      });
    }

    sendMessage() {
      if (this.modelSend.content.trim() === '') {
        return; 
      }
  
      this.authService.sendMessage(this.modelSend).subscribe({
        next: (response) => {

          this.message = response;

          // Create a new message object from the response
          const newMessage: ConvoHistoryResponse = {
            id: this.message.messageId,
            receiverId: this.message.receiverId,
            senderId: this.message.senderId,
            content: this.message.content,
            timeStamp: this.message.timeStamp,
          };
  
          // Add the new message to the beginning of the conversation history
          this.convoHistory = [...(this.convoHistory || []), newMessage];
  
          // Clear the message input field
          this.modelSend.content = '';
  
          console.log('Message sent successfully');
        },
        error: (error) => {
          console.error('Error sending message:', error);
          
        }
      });
    }

    


    showContextMenu(event: MouseEvent, index: number) {
      event.preventDefault();
      this.editingIndex = index;
    }

    onMessageEditDone(index: number) {
      if (this.editingIndex === index) {
        this.editingIndex = null;
      }
    }

    acceptEdit(index: number) {
      if (this.editingIndex === index) {
        const editedMessage = this.convoHistory[index];
        this.modelEdit.messageId = editedMessage.id;
        this.modelEdit.content = editedMessage.content;

        this.authService.editMessage(this.modelEdit).subscribe({
          next: (response) => {
            console.log('Message edited successfully');
            this.onMessageEditDone(index);
          },
          error: (error) => {
            console.error('Error editing message:', error);
          }
        });
      }
    }

    declineEdit(index: number) {
      if (this.editingIndex === index) {
        this.onMessageEditDone(index);
        // You can choose to discard any changes made during editing here
      }
    }

  }

  
  

