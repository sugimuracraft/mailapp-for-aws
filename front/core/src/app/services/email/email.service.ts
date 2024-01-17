import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';


export interface Email {
  user: string,
  receivedAt: string,
  status: string,
  messageId: string,
  from: string,
  subject: string,
  body?: string,
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  constructor() { }

  list$(): Observable<Email[]> {
    return of([
      {
        'user': 'user1',
        'receivedAt': "2024-01-12T13:59:32.237Z",
        'status': "new",
        'messageId': "o7qi7a9s0rjeqn63ogtjba1ahhmtrbss1b152ro1",
        'from': 'sender1@example.com',
        'subject': 'メールタイトル1',
      },
      {
        'user': 'user1',
        'receivedAt': "2024-01-12T10:02:57.855Z",
        'status': "new",
        'messageId': "jvgnivetkc91qfjtbmsb4f7r8eh14o5k9eoi4701",
        'from': 'sender2@example.com',
        'subject': 'メールタイトル2',
      },
    ]);
  }
}
