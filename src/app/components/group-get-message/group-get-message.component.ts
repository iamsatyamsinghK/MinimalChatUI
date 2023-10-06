import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { groupConvoRequest } from 'src/app/models/group-convo-request.model';
import { AuthService } from 'src/app/services/auth.service';
import { switchMap } from 'rxjs/operators';
import { groupConvoResponse } from 'src/app/models/group-convo-response.model';
import { UserProfile } from 'src/app/models/user-profile.model';
import { SendMessageToNewChatRequestDto } from 'src/app/models/SendMessageToNewChatRequestDto.model';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-group-get-message',
  templateUrl: './group-get-message.component.html',
  styleUrls: ['./group-get-message.component.css']
})
export class GroupGetMessageComponent implements OnInit, OnChanges  {

  model: groupConvoRequest;
  chatId!: number;
  messages: groupConvoResponse[] = [];
  user?: UserProfile;
  messageContent: string = '';
  private connection!: HubConnection;




  constructor(private authService: AuthService, private route: ActivatedRoute) {
    this.model = {
      chatId: 0,
      before: null,
      count: 1000,
      sort: 'desc'
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    
  }
  ngOnInit(): void {


    this.authService.user().subscribe({
      next: (response) => {
        this.user = response;
      }
      
    });

    const localToken = localStorage.getItem('token');
    this.connection = new HubConnectionBuilder()

      .withUrl(`https://localhost:7198/chat/hub?access_token=${localToken}`)
      .build();

    this.connection.start()
      .then(() =>
        console.log('group conn start'))
        
      .catch(error => {
        console.log(error)
      });

    
      this.connection.on('Group', (message) => {
        console.log("Inside group connection");
        console.log("Before Push:", this.messages);
    
        // Check if the message already exists in the messages array
        const existingMessage = this.messages.find(m => m.messageId === message.messageId);
        if (!existingMessage) {
            this.messages.push(message);
        }
    })
    

    this.user = this.authService.getUser();

    this.route.paramMap.pipe(
      switchMap(params => {
        const chatIdString = params.get('id');
        if (chatIdString !== null) {
          this.chatId = parseInt(chatIdString, 10);
          this.model.chatId = this.chatId;
          return this.authService.getGroupConvoHistory(this.model);
        }
        return [];
      }),
      distinctUntilChanged() // Add distinctUntilChanged here to avoid duplicate messages
    ).subscribe(messages => {
      this.messages = messages;
      // Do something with the updated messages
    });
  }
  
  sendMessage(): void { 
    // Extract unique receiver IDs from the messages using Set
    const receiverIdsSet = new Set<string>();
  
    this.messages.forEach(message => {
      message.receiverIds.forEach(receiverId => {
        receiverIdsSet.add(receiverId);
      });
    });
  
    // Convert the Set back to an array and remove the logged-in user's ID
    const receiverIds = Array.from(receiverIdsSet).filter(id => id !== this.user?.userId);
  
    // Convert the Set back to an array
    // const receiverIds = Array.from(receiverIdsSet);
  
    const request: SendMessageToNewChatRequestDto = {
      receiverIds: receiverIds,
      content: this.messageContent
    };
  
    this.authService.sendMessageToNewChat(request).subscribe(response => {
      console.log('Message sent successfully!', response);
  
      // Update messages in real-time
      this.messages.push(response);
      this.messageContent = ''; // Clear the message input after sending
    });
  }

}
