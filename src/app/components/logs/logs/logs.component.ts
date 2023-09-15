import { Component, OnInit } from '@angular/core';
import { LogRequest } from 'src/app/models/log-request.model';
import { LogResponse } from 'src/app/models/log-response.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  logs: LogResponse[] = [];
  
  selectedTimeframe: string = 'last5mins';
  showColumns = {
    ipAddress: true,
    username: true,
    requestPath: true,
    requestBody: true,
    timestamp: true,
  };

  request: LogRequest;
  

  constructor(private authService: AuthService) {
    this.request = {
      startTime: new Date(),
      endTime: new Date(),
    };
  }
  

  ngOnInit(): void {
     this.fetchLogs();
  }

  fetchLogs(): void {
    // Determine the time range based on the selectedTimeframe
    const currentTime = new Date();
    let startTime = new Date();
    let endTime = new Date(); // Declare endTime here to make it accessible outside the if block

    switch (this.selectedTimeframe) {
      case 'last5mins':
        startTime = new Date(currentTime.getTime() - 5 * 60 * 1000);
        break;
      case 'last10mins':
        startTime = new Date(currentTime.getTime() - 10 * 60 * 1000);
        break;
      case 'last30mins':
        startTime = new Date( currentTime.getTime() - 30 * 60 * 1000);
        break;
    }

    if (this.selectedTimeframe === 'custom' && this.request.startTime && this.request.endTime) {
        this.logs =[];
      startTime = this.request.startTime;
      endTime = this.request.endTime; // Assign the value to endTime here
    }

    // Set the request object's startTime and endTime
    this.request.startTime = startTime;
    this.request.endTime = endTime; // Use the value of endTime

    // Call the log service to get logs based on the request
    this.authService.getLogs(this.request).subscribe((logs) => {
      this.logs = logs;
    });
  }

  // Function to handle custom time change
  onCustomTimeChange(): void {
    this.request.startTime = new Date(this.request.startTime);
    this.request.endTime = new Date(this.request.endTime);

    if (this.request.startTime && this.request.endTime) {
      this.fetchLogs();
    } else {
      
    }
  }

  onTimeframeChange(): void {
    // Clear logs when the selected timeframe changes to "Custom"
    
      this.logs = [];
    

    // Fetch logs based on the new timeframe
    this.fetchLogs();
  }

}
