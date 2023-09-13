import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ConvoHistoryComponent } from './components/convo-history/convo-history.component';
import { UserListComponent } from './components/user-list/user-list.component';
import { authGuard } from './components/guards/auth.guard';
import { RegisterComponent } from './components/register/register.component';


const routes: Routes = [

  {
    path : '',
    redirectTo : 'login',
    pathMatch : 'full',
    
    
  },

  {
    path: 'register',
    component: RegisterComponent,
    
  },
  {
    path: 'login',
    component: LoginComponent,
    
  },
 
  {
    path: 'user-list',
    component: UserListComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'convo/:id', // Child route
        component: ConvoHistoryComponent,
        canActivate: [authGuard]
      },
      
    ]
  }
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
