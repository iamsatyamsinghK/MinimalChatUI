import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SendMessageRequestCollectiveDto } from 'src/app/models/SendMessageRequestCollectiveDto.model';
import { ConvoHistoryResponse } from 'src/app/models/convo-history-response.model';
import { UserProfile } from 'src/app/models/user-profile.model';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { groupInfo } from 'src/app/models/group-info.model';


@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  user?: UserProfile;
  userList?: UserProfile[];
  searchString: string = ''; // Initialize search string
  showSearchResults: boolean = false; // Flag to show/hide search results
  groups: groupInfo[] = [];
  showGroups: boolean = true;


  convoHistory: ConvoHistoryResponse[] = [];
  selectedUsers: UserProfile[] = [];
  collectiveMessageContent: string = '';

  constructor(private authService: AuthService, private router: Router, private _ngZone: NgZone, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.authService.user().subscribe({
      next: (response) => {
        this.user = response;

      }
    });

    this.user = this.authService.getUser();

    this.authService.getUserList().subscribe({
      next: (response) => {
        this.userList = response;
      }
    });




  }




  
  toggleUserSelection(user: UserProfile): void {


    // Add or remove from selected users array
    if (user.selected) {
      this.selectedUsers.push(user);
      console.log('b')
    } else {
      console.log('c')
      const index = this.selectedUsers.findIndex((u) => u.userId === user.userId);
      if (index !== -1) {
        this.selectedUsers.splice(index, 1);
      }
    }
  }
  // Send a collective message to selected users
  sendMessageToSelectedUsers(): void {
    // Check if any users are selected
    if (this.selectedUsers.length === 0 || !this.collectiveMessageContent.trim()) {
      console.log('no user')
      return;
    }

    // Extract receiver IDs from selected users
    const receiverIds = this.selectedUsers
      .filter((user) => user.userId !== undefined)
      .map((user) => user.userId!);

    // Create a SendMessageRequestCollectiveDto object
    const sendMessageDto: SendMessageRequestCollectiveDto = {
      receiverIds,
      content: this.collectiveMessageContent
    };

    // Call a method to send the message using the DTO (You can implement this in your service)
    this.authService.sendCollectiveMessage(sendMessageDto).subscribe({
      next: (response) => {
        // Handle the response, e.g., show a success message
        console.log('Message sent successfully to selected users:', response);

        this.showNotification('Message sent successfully to selected users');

        // Clear the message input
        this.collectiveMessageContent = '';

        // Deselect all users
        this.selectedUsers.forEach((user) => {
          user.selected = false;
        });

        // Clear the selectedUsers array
        this.selectedUsers = [];
      },

      error: (error) => {
        console.error('Error sending collective message:', error);
      }
    });
  }


  private showNotification(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000, // Display duration in milliseconds
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }

  onLogout() {
    this.authService.signOutExternal();
    this._ngZone.run(() => {
      this.router.navigate(['/']).then(() => window.location.reload());
    })

  }

  searchConversation() {
    if (this.searchString.trim() === '') {
      // Handle empty search string (optional)
      return;
    }

    // Make an API call to search for conversations
    this.authService.searchConversation(this.searchString).subscribe(
      (response) => {
        this.convoHistory = response;
        this.showSearchResults = true;
      },
      (error) => {
        // Handle API call error and show an appropriate message
        console.error('Error searching conversation:', error);
        // You can display an error message to the user if needed
      }
    );
  }

  closeSearchResults() {
    this.showSearchResults = false;
    this.convoHistory = [];
  }

  clearSearchInput() {
    this.searchString = ''; // Clear the search input field
  }


}
