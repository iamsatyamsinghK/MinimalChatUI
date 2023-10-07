import { Injectable } from '@angular/core';
import { groupInfo } from './models/group-info.model';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GroupResolver implements Resolve<groupInfo[]> {
  constructor(private authService: AuthService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<groupInfo[]> {
    // Do not fetch groups here, resolve an empty array
    return of([]);
  }
}
