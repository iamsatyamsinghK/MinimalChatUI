import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RegisterRequest } from 'src/app/models/register-request.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  model: RegisterRequest;

  constructor(private authService: AuthService, private router: Router) {
    this.model = {
      email: '',
      password: '',
      name: ''
    };
  }

  onFormSubmit(): void {
    this.authService.register(this.model)
      .subscribe({
        next: (response) => {
          
          this.router.navigateByUrl('/login');
        }
      });
  }

}

