import { Component, OnInit } from '@angular/core';
import { ConvoHistoryRequest } from 'src/app/models/convo-history-request.model';
import { ConvoHistoryResponse } from 'src/app/models/convo-history-response.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-convo-history',
  templateUrl: './convo-history.component.html',
  styleUrls: ['./convo-history.component.css']
})
export class ConvoHistoryComponent implements OnInit {

  convoHistory?:ConvoHistoryResponse[];

  model: ConvoHistoryRequest

  constructor(private authService: AuthService){
    this.model ={
      userId: 0,
      before: new Date(),
      count: 0,
      sort: ''
    };
  }

  ngOnInit(): void {

    this.authService.getConvoHistory(this.model).subscribe({
      next: (response)=> {
        this.convoHistory = response;
      }
    });
    
  }

}
