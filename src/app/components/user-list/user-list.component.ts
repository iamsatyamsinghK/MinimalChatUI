import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConvoHistoryResponse } from 'src/app/models/convo-history-response.model';
import { UserProfile } from 'src/app/models/user-profile.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent  implements OnInit {

  user?: UserProfile;
  userList?:UserProfile[];
  searchString: string = ''; // Initialize search string
  showSearchResults: boolean = false; // Flag to show/hide search results
  
  convoHistory: ConvoHistoryResponse[] = [];

  constructor(private authService: AuthService, private router: Router, private _ngZone: NgZone){}

  ngOnInit(): void {
    this.authService.user().subscribe({
      next:(response)=> {
        this.user = response;
      }
    });

    this.user = this.authService.getUser();

    this.authService.getUserList().subscribe({
      next: (response)=> {
        this.userList = response;
      }
    });

  }

  onLogout(){
    this.authService.signOutExternal();
    this._ngZone.run(()=>{
      this.router.navigate(['/']).then(()=> window.location.reload());
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
