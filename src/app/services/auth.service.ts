import { Injectable } from '@angular/core';
import { LoginRequest } from '../models/login-request.model';
import { BehaviorSubject, Observable } from 'rxjs';
import {HttpClient, HttpParams} from '@angular/common/http'
import { LoginResponse } from '../models/login-response.model';
import { environment } from 'src/environments/environment.development';
import { UserProfile } from '../models/user-profile.model';
import { CookieService } from 'ngx-cookie-service';
import { RegisterRequest } from '../models/register-request.model';
import { RegisterResponse } from '../models/register-response.model';
import { ConvoHistoryResponse } from '../models/convo-history-response.model';
import { ConvoHistoryRequest } from '../models/convo-history-request.model';
import { SendMessageRequest } from '../models/send-message-request.model';
import { SendMessageResponse } from '../models/send-message-response.model';
import { EditMessageRequest } from '../models/edit-message-request.model';
import { LogRequest } from '../models/log-request.model';
import { LogResponse } from '../models/log-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  $user = new BehaviorSubject<UserProfile|undefined>(undefined);

  constructor(private http: HttpClient, private cookieService: CookieService) { }

  login(request: LoginRequest): Observable<LoginResponse>{
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/api/Auth/login`, request);
  }

  register(request: RegisterRequest): Observable<RegisterResponse>{
    return this.http.post<RegisterResponse>(`${environment.apiBaseUrl}/api/Auth/register`, request);
  }

  getUserList(): Observable<UserProfile[]>{
    return this.http.get<UserProfile[]>(`${environment.apiBaseUrl}/api/UserCRUD`);
  }

  getConvoHistory(request: ConvoHistoryRequest): Observable<ConvoHistoryResponse[]>{
    //const formattedDate = request.before?.toISOString() || new Date().toISOString();
    
    if(request.before != null){

      return this.http.get<ConvoHistoryResponse[]>(`${environment.apiBaseUrl}/api/UserCRUD/messages?UserId=${request.userId}&Before=${request.before}&Count=${request.count}&Sort=${request.sort}`)
    }else{
      return this.http.get<ConvoHistoryResponse[]>(`${environment.apiBaseUrl}/api/UserCRUD/messages?UserId=${request.userId}&Count=${request.count}&Sort=${request.sort}`)
    }
  }
  

  sendMessage(request: SendMessageRequest): Observable<SendMessageResponse>{
    return this.http.post<SendMessageResponse>(`${environment.apiBaseUrl}/api/UserCRUD`, request);
  }

  editMessage(request: EditMessageRequest): Observable<any>{
    return this.http.put<any>(`${environment.apiBaseUrl}/api/UserCRUD`, request);
  }

  deleteMessage(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiBaseUrl}/api/UserCRUD/${id}`);
  }

  getLogs(request: LogRequest): Observable<LogResponse[]> {
    // Convert DateTime objects to ISO strings
    
      const startTime = request.startTime?.toISOString() || new Date().toISOString();
      const endTime = request.endTime?.toISOString() || new Date().toISOString();

    return this.http.get<LogResponse[]>(`${environment.apiBaseUrl}/api/Log?EndTime=${encodeURIComponent(endTime)}&StartTime=${encodeURIComponent(startTime)}`);
  }



















  setUser(user: UserProfile): void {

    this.$user.next(user);

    localStorage.setItem('user-email',user.email);
    localStorage.setItem('user-name', user.name);
    localStorage.setItem('user-id', user.userId.toString());
  }

  getUser(): UserProfile|undefined{
    const email = localStorage.getItem('user-email');
    const name = localStorage.getItem('user-name');
    const userId = localStorage.getItem('user-id'); 

    if(email && name && userId){
      const user : UserProfile = {
        email: email,
        name: name,
        userId: parseInt(userId, 10)
      };
      return user;
    }
    return undefined;
  }

  user(): Observable<UserProfile|undefined>{
    return this.$user.asObservable();
  }

  logout(): void{
    localStorage.clear();
    this.cookieService.delete('Authorization','/');
    this.$user.next(undefined);
  }
}
