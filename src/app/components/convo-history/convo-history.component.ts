import { Component, OnChanges, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, SimpleChanges, ElementRef, ViewChild, HostListener, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConvoHistoryRequest } from 'src/app/models/convo-history-request.model';
import { ConvoHistoryResponse } from 'src/app/models/convo-history-response.model';
import { EditMessageRequest } from 'src/app/models/edit-message-request.model';
import { SendMessageRequest } from 'src/app/models/send-message-request.model';
import { SendMessageResponse } from 'src/app/models/send-message-response.model';
import { UserProfile } from 'src/app/models/user-profile.model';
import { AuthService } from 'src/app/services/auth.service';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import * as signalR from "@microsoft/signalr";


@Component({
  selector: 'app-convo-history',
  templateUrl: './convo-history.component.html',
  styleUrls: ['./convo-history.component.css']
})
export class ConvoHistoryComponent implements OnInit, OnDestroy, OnChanges {

  user?: UserProfile;

  editingIndex: number | null = null;

  editedMessageContent: string = '';

  convoHistory: ConvoHistoryResponse[] = [];

  private connection!: HubConnection;


  message?: SendMessageResponse;

  receiverId: string | null | undefined;

  paramsSubscription?: Subscription;

  model: ConvoHistoryRequest;

  modelSend: SendMessageRequest;

  modelEdit: EditMessageRequest;
  currentPosition: number = 0;


  @ViewChild('messageContainer', { static: false }) messageContainer!: ElementRef;

  

  constructor(private authService: AuthService, private route: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef) {
    this.model = {
      userId: '',
      before: null,
      count: 20,
      sort: 'desc'
    };
    this.modelSend = {
      receiverId: '',
      content: ''
    };
    this.modelEdit = {
      messageId: 0,
      content: ''
    };

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
        console.log('conn start'))
        
      .catch(error => {
        console.log(error)
      });

    
      this.connection.on('BroadCast', (message) => {
        console.log("Inside conncection")
      // message.id = message.MessageId;
      // console.log(message.MessageId);
      console.log("Before Push:", this.convoHistory);
      this.convoHistory.push(message);
      // console.log("after Push:", this.convoHistory);
      // console.log(message.id);
      // console.log(this.convoHistory);
     // this.getConvoHistory();
    })

    this.user = this.authService.getUser();

    this.route.paramMap.subscribe({
      next: (params) => {
        this.receiverId = params.get('id');
        if (this.receiverId !== null) {
          this.model.userId = this.receiverId;
          this.modelSend.receiverId = this.receiverId;
          this.getConvoHistory();

        }
      }
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
  }

  scrollMessageContainerToBottom() {
    const messageContainer = document.querySelector('.messageContainer')
    if (messageContainer) {

      messageContainer.scrollTop = messageContainer.scrollHeight;
      console.log('scroll')
    }
  }

  private getConvoHistory(loadMore: boolean = false) {


    if (loadMore && this.convoHistory.length > 0) {


      this.model.before = (this.convoHistory[0].timestamp);
      this.authService.getConvoHistory(this.model).subscribe({
        next: (response) => {


          const olderMessages = response.reverse()

          this.convoHistory = [...olderMessages, ...this.convoHistory]

          this.currentPosition += response.length;
          ;
        },
        error: (error) => {
          console.error('Error fetching conversation history:', error);
        }
      });
      console.log("sdgrhdrthth", this.convoHistory[0].timestamp)
    }


    else {

      this.model.before = null;

      this.authService.getConvoHistory(this.model).subscribe({
        next: (response) => {



          this.convoHistory = response.reverse();
          this.currentPosition = response.length;

          setTimeout(() => {
            this.scrollMessageContainerToBottom();
          });
        },
        error: (error) => {
          console.error('Error fetching conversation history:', error);
        },
      });
    }
  }





  @HostListener('window:scroll', ['$event'])
  onScroll(event: any): void {
    const messageContainer = this.messageContainer.nativeElement;
    if (
      messageContainer.scrollTop === 0 &&

      this.currentPosition > 0
    ) {
      console.log("scrolling");
      this.getConvoHistory(true); // Load more messages
    }
  }




  ngOnChanges(changes: SimpleChanges): void {
    // Check if the 'receiverId' property has changed
    if (changes['receiverId'] && !changes['receiverId'].firstChange) {
      // 'changes['receiverId'].currentValue' contains the new 'receiverId' value
      const newReceiverId = changes['receiverId'].currentValue;

      // Update the 'model.userId' with the new 'receiverId' value
      this.model.userId = newReceiverId;

      // Call the API to get updated messages
      this.getConvoHistory();
    }
  }



  sendMessage() {
    if (this.modelSend.content.trim() === '') {
      return;
    }
  
   
      // Send the message via API request
      this.authService.sendMessage(this.modelSend).subscribe({
        next: (response) => {
          this.message = response;
          // Create a new message object from the response
          const newMessage: ConvoHistoryResponse = {
            id: this.message.messageId,
            receiverId: this.message.receiverId,
            senderId: this.message.senderId,
            content: this.message.content,
            timestamp: this.message.timeStamp,
          };
  
          this.convoHistory.push(newMessage);
  
          // Clear the message input field
          this.modelSend.content = '';
          this.scrollMessageContainerToBottom();
  
          console.log('Message sent successfully via API');
        },
        error: (error) => {
          console.error('Error sending message via API:', error);
        },
      });
    }
  
  



  showContextMenu(event: MouseEvent, id: number) {
    event.preventDefault();
    this.editingIndex = id;
    console.log('yah');
  }

  onMessageEditDone(id: number) {
    if (this.editingIndex === id) {
      this.editingIndex = null;
      console.log('y');
    }
  }

  acceptEdit(id: number) {
    console.log('acceptEdit function called');
    const editedMessage = this.convoHistory.find((message) => message.id === id);
    if (editedMessage && this.editingIndex === id) {
      this.modelEdit.messageId = editedMessage.id;
      this.modelEdit.content = this.editedMessageContent;
      console.log('yah tk');

      this.authService.editMessage(this.modelEdit).subscribe({
        next: (response) => {
          // Update the message content in the client-side array
          editedMessage.content = this.modelEdit.content;
          console.log('Message edited successfully');
          this.onMessageEditDone(id);
        },
        error: (error) => {
          console.error('Error editing message:', error);
        }
      });
    }
  }

  cancelEdit(id: number) {

    this.editedMessageContent = '';
    this.editingIndex = null;

  }

  deleteMessage(id: number) {

    this.authService.deleteMessage(id).subscribe({
      next: (response) => {

        this.convoHistory = this.convoHistory.filter((message) => message.id !== id);
        console.log('Message deleted successfully');

        this.cancelEdit(id);
      },
      error: (error) => {
        console.error('Error deleting message:', error);
      }
    });
  }


}