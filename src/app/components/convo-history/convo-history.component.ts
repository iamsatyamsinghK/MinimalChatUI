import { Component, OnChanges, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef, SimpleChanges, ElementRef, ViewChild, HostListener, Renderer2    } from '@angular/core';
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

  editedMessageContent: string = '';

  convoHistory: ConvoHistoryResponse[] = [];


  message?: SendMessageResponse;

  receiverId: string | null | undefined;

  paramsSubscription?: Subscription;

  model: ConvoHistoryRequest;

  modelSend: SendMessageRequest;

  modelEdit: EditMessageRequest;

 @ViewChild('messageContainer', { static: false }) messageContainer!: ElementRef;


  constructor(private authService: AuthService, private route: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef ) {
    this.model = {
      userId: 0,
      before: new Date(),
      count: 20,
      sort: 'desc'
    };
    this.modelSend = {
      receiverId: 0,
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

    this.user = this.authService.getUser();

    this.route.paramMap.subscribe({
      next: (params) => {
        this.receiverId = params.get('id');
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

  // ngAfterViewInit(): void {
  //   this.scrollMessageContainerToBottom(); // Scroll to the bottom initially
  // }
scrollMessageContainerToBottom() {
  const messageContainer= document.querySelector('.messageContainer')
  if (messageContainer) {
   
    messageContainer.scrollTop = messageContainer.scrollHeight;
    console.log('scroll')
  }
}
  
private getConvoHistory(loadMore: boolean = false) {
  if (loadMore && this.convoHistory.length > 0) {
    // If loading more, adjust the 'before' timestamp to fetch older messages
    this.model.before = this.convoHistory[this.convoHistory.length - 1].timeStamp;
  } else {
    // If not loading more, set 'before' to the current timestamp initially
    this.model.before = new Date();
  }

  this.authService.getConvoHistory(this.model).subscribe({
    next: (response) => {
      if (loadMore) {
        // If loading more, remove the last message (already shown) before appending new messages
        this.convoHistory.pop();
        this.convoHistory.push(...response.reverse()); // Reverse the new messages before appending
      } else {
        // If not loading more, replace the convoHistory with new messages
        this.convoHistory = response.reverse(); // Reverse the entire convoHistory
      }

      // Scroll to the bottom after updating convoHistory
      setTimeout(() => {
        this.scrollMessageContainerToBottom();
      });
    },
    error: (error) => {
      console.error('Error fetching conversation history:', error);
    },
  });
}



@HostListener('window:scroll', ['$event'])
onScroll(event: any): void {
  const messageContainer = this.messageContainer.nativeElement;
  if (
    messageContainer.scrollTop === 0 && // Scrolled to the top
    this.convoHistory.length >= 20 // Ensure there are at least 20 messages
  ) {
    this.getConvoHistory(true); // Load more messages
  }
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

       
        this.convoHistory.push(newMessage);

        // Clear the message input field
        this.modelSend.content = '';
        this.scrollMessageContainerToBottom();

        console.log('Message sent successfully');
      },
      error: (error) => {
        console.error('Error sending message:', error);

      }
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