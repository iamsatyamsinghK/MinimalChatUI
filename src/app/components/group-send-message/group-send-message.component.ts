import { outputAst } from '@angular/compiler';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { SendMessageToNewChatRequestDto } from 'src/app/models/SendMessageToNewChatRequestDto.model';
import { groupInfo } from 'src/app/models/group-info.model';
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
  groups:groupInfo[] = [];

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
  
    // Step 1: Send the message and wait for the response
    this.authService.sendMessageToNewChat(request).subscribe(response => {
      console.log('Message sent successfully!', response);
  
      // Step 2: Get the current groups after sending the message
      this.authService.getGroups().subscribe({
        next: (currentGroups) => {
          // Merge newly created group into the current groups
          const newlyCreatedGroup: groupInfo = {
            chatId: response.chatId,
            receivers: response.receivers
          };
  
          // Ensure the newly created group is not already in the current groups
          const groupIndex = currentGroups.findIndex(group => group.chatId === newlyCreatedGroup.chatId);
          if (groupIndex === -1) {
            // If the group is not in the current groups, add it
            currentGroups.push(newlyCreatedGroup);
          } else {
            // If the group is in the current groups, update it
            currentGroups[groupIndex] = newlyCreatedGroup;
          }
  
          // Update the groups in AuthService
          this.authService.updateGroups(currentGroups);
          // Update the local component groups as well
          this.groups = currentGroups;
        },
        error: (error) => {
          console.error('Error fetching groups:', error);
          // Handle the error, show a message to the user, or retry the operation if necessary
        }
      });
    });
  
  


    this.selectedUsers = [];
    this.messageContent = '';
    this.router.navigate(['/user-list']);
  }

  closeWindow(): void {
    
    this.router.navigate(['/user-list']); 
 }

 removeUser(user: UserProfile): void {
 
  this.selectedUsers = this.selectedUsers.filter(u => u.userId !== user.userId);
  
}

}

