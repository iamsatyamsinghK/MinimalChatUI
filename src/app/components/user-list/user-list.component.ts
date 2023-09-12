import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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

  constructor(private authService: AuthService, private router: Router){}

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

  onLogout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/');
  }

}
