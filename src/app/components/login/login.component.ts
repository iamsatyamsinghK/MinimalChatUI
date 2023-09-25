import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { LoginRequest } from 'src/app/models/login-request.model';
import { AuthService } from 'src/app/services/auth.service';
import { CredentialResponse, PromptMomentNotification } from 'google-one-tap';
import { environment } from 'src/environments/environment.development';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private clientId = environment.clientId;

  model: LoginRequest;

  constructor(private authService: AuthService, private cookieService: CookieService, 
    private router: Router, private _ngZone: NgZone){
    this.model ={
      email: '',
      password: ''
    };
  }

  ngOnInit(): void {

    // @ts-ignore
    window.onGoogleLibraryLoad = () => {
      // @ts-ignore
      google.accounts.id.initialize({
        client_id: this.clientId,
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      // @ts-ignore
      google.accounts.id.renderButton(
      // @ts-ignore
      document.getElementById("buttonDiv"),
        { theme: "outline", size: "large", width: "100%" } 
      );
      // @ts-ignore
      google.accounts.id.prompt((notification: PromptMomentNotification) => {});
    };
  }

  async handleCredentialResponse(response: CredentialResponse) {
    await this.authService.LoginWithGoogle(response.credential).subscribe(
      (x:any) => {
        this.cookieService.set('Authorization',
       `Bearer ${x.token}`,undefined,'/',undefined,true,'Strict' );
       localStorage.setItem("token",x.token)

       this.authService.setUser(x.profile)
        this._ngZone.run(() => {
          this.router.navigate(['/user-list']);
        })},
      (error:any) => {
          console.log(error);
        }
      );  
}

  

  onFormSubmit(): void {

    this.authService.login(this.model).subscribe({ next: (response)=> {
      console.log(response);
      this.cookieService.set('Authorization',
       `Bearer ${response.token}`,undefined,'/',undefined,true,'Strict' );
       localStorage.setItem("token",response.token)

       this.authService.setUser(response.profile)
       this.router.navigateByUrl('/user-list');

      }
    });
  }
}
