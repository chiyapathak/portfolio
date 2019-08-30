import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SendMailService {

  constructor(private http: HttpClient) { }

  apiUrl = 'http://localhost:3000/sendMail';

  send(data) {
    return this.http.post(this.apiUrl, data);
  }
}
