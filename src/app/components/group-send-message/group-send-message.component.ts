import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SendMessageToNewChatRequestDto } from 'src/app/models/SendMessageToNewChatRequestDto.model';
import { UserProfile } from 'src/app/models/user-profile.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-group-send-message',
  templateUrl: './group-send-message.component.html',
  styleUrls: ['./group-send-message.component.css']
})
export class GroupSendMessageComponent implements OnInit {

  userList: UserProfile[] = [];
  selectedUsers: UserProfile[] = [];
  selectedUserId: string = '';
  messageContent: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.authService.getUserList().subscribe({
      next: (response) => {
        this.userList = response;
      }
    });
  }

  onUserSelected(): void {
    const selectedUser = this.userList.find(user => user.userId === this.selectedUserId);
    if (selectedUser && !this.selectedUsers.some(user => user.userId === selectedUser.userId)) {
      this.selectedUsers.push(selectedUser);
    }
    console.log('Selected Users:', this.selectedUsers.map(user => user.name));
  }

  sendMessage(): void {
    const receiverIds = this.selectedUsers
      .filter(user => user.userId !== undefined)
      .map(user => user.userId!);

    const request: SendMessageToNewChatRequestDto = {
      receiverIds: receiverIds,
      content: this.messageContent
    };

    this.authService.sendMessageToNewChat(request).subscribe(response => {
      console.log('Message sent successfully!', response);
    });

    this.selectedUsers = [];
    this.messageContent = '';
  }

  closeWindow(): void {
    
    this.router.navigate(['/user-list']); 
 }

 removeUser(user: UserProfile): void {
 
  this.selectedUsers = this.selectedUsers.filter(u => u.userId !== user.userId);
  
}

}

