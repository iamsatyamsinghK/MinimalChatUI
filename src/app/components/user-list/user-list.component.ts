import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SendMessageRequestCollectiveDto } from 'src/app/models/SendMessageRequestCollectiveDto.model';
import { ConvoHistoryResponse } from 'src/app/models/convo-history-response.model';
import { UserProfile } from 'src/app/models/user-profile.model';
import { AuthService } from 'src/app/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { groupInfo } from 'src/app/models/group-info.model';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';



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
  private connection!: HubConnection;


  convoHistory: ConvoHistoryResponse[] = [];
  selectedUsers: UserProfile[] = [];
  collectiveMessageContent: string = '';

  constructor(private authService: AuthService,private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) { }

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
      .then(() => {
        console.log('Group add Connection started');
       
      })
      .catch(error => {
        console.error(error);
      });

      
      this.connection.on('UpdatedGroups', (updatedGroups) => {
        console.log("ON");
      
        this._ngZone.run(() => {
          // Check if the group already exists in the groups array
          const existingGroupIndex = this.groups.findIndex(group => group.chatId === updatedGroups.chatId);
      
          // If the group doesn't exist, add it to the groups array
          if (existingGroupIndex === -1) {
            this.groups.push(updatedGroups);
          } else {
            // If the group already exists, update its properties
            this.groups[existingGroupIndex] = updatedGroups;
          }
        });
      });

      

     this.connection.on('BroadCast', (message) => {
      console.log("HU");


      
        // Display a notification
        this.Notification(message.senderName, message.content,message.senderId);


    });

    this.connection.on('Group', (message) => {
      console.log("Inside group connection");
      console.log("THU");

      this.Notification2(message.receivers, message.content,message.chatId);
  })


    this.user = this.authService.getUser();

    this.authService.getUserList().subscribe({
      next: (response) => {
        this.userList = response;
      }
    });


    this.authService.getGroups().subscribe((groups) => {
      this.groups = groups;
    });
  
    this.authService.groups$.subscribe((updatedGroups) => {
      this.groups = updatedGroups;
    });
  
    
  }

  private Notification(senderName: string, content: string, id:string): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification('New Message', {
        body: `${senderName}: ${content}`
      });

      notification.onclick = () => {
        // Handle notification click, navigate to the conversation component
        this.navigateToConversation(id); 
        // this.hasUnreadMessages = false;
        notification.close();
      };
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.Notification(senderName, content,id);
        }
      });
    }
  }

  private Notification2(senderName: string, content: string, id:string): void {
    if (Notification.permission === 'granted') {
      const notification = new Notification('New Message', {
        body: `${senderName}: ${content}`
      });

      notification.onclick = () => {
        // Handle notification click, navigate to the conversation component
        this.navigateToConversation(id); 
        // this.hasUnreadMessages = false;
        notification.close();
      };
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          this.Notification(senderName, content,id);
        }
      });
    }
  }


  private navigateToConversation(userId: string | number): void {
    let url: string;
  
    if (typeof userId === 'number') {
      // If user ID is a number, navigate to a different URL
      url = `/user-list/group-messages/${userId}`;
    } else {
      // If user ID is not a number, navigate to the default URL
      url = `/user-list/convo/${userId}`;
    }
  
    // Navigate to the conversation component using Angular Router
    this.router.navigateByUrl(url);
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
