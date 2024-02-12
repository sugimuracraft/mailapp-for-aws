import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface Email {
  user: string,
  receivedAt: string,
  status: string,
  messageId: string,
  from?: string,
  subject?: string,
  body?: string,
}

export interface EmailLastEvaluatedKey {
  user: string,
  receivedAt: string,
}

export interface EmailListResponse {
  ScannedCount: number,
  Count: number,
  Items: Email[],
  LastEvaluatedKey?: {[param: string]: string},
}

const orderByReceivedAtDesc = (a: Email, b: Email) => {
  return a.receivedAt < b.receivedAt ? 1 : -1;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  public count: number
  public hasNext: boolean
  public items: Email[] // stored items.
  public lastEvaluatedKey: {[param: string]: string} | null // if not all items have been retrieved, this value is set.
  public stored: boolean // whether items retrieve from api or not.
  public totalCount: number

  constructor(
    private http: HttpClient,
  ) {
    this.count = 0;
    this.hasNext = false;
    this.items = [];
    this.lastEvaluatedKey = null;
    this.stored = false;
    this.totalCount = 0;
  }

  list$(): Observable<Email[]> {
    return this.http.get<EmailListResponse>(`${environment.api.url}/emails/`).pipe(
      switchMap((value: EmailListResponse) => {
        this.count = value.Count;
        if (!value.LastEvaluatedKey) {
          this.hasNext = false;
          this.lastEvaluatedKey = null;
        }
        else {
          this.hasNext = true;
          this.lastEvaluatedKey = value.LastEvaluatedKey;
        }
        this.items = value.Items.sort(orderByReceivedAtDesc);
        this.stored = true;
        this.totalCount = value.ScannedCount;
        return of(this.items);
      })
    );
  }

  listNext$(): Observable<Email[]> {
    if (!this.lastEvaluatedKey) {
      return of(this.items);
    }
    return this.http.get<EmailListResponse>(
      `${environment.api.url}/emails/`,
      {
        params: new HttpParams().append('k', this.lastEvaluatedKey["receivedAt"]),
      },
    ).pipe(
      switchMap((value: EmailListResponse) => {
        this.count += value.Count;
        if (!value.LastEvaluatedKey) {
          this.hasNext = false;
          this.lastEvaluatedKey = null;
        }
        else {
          this.hasNext = true;
          this.lastEvaluatedKey = value.LastEvaluatedKey;
        }
        this.items = this.items.concat(value.Items.sort(orderByReceivedAtDesc));
        return of(this.items);
      })
    );
  }

  /*retrieve$(messageId: string): Observable<Email> {
    return this.http.get<EmailDetailResponse>(`${environment.api.url}/emails/${messageId}/`).pipe(
      switchMap((value: EmailDetailResponse) => {
        this.count = value.Count;
        if (!value.LastEvaluatedKey) {
          this.hasNext = false;
          this.lastEvaluatedKey = null;
        }
        else {
          this.hasNext = true;
          this.lastEvaluatedKey = value.LastEvaluatedKey;
        }
        this.items = value.Items.sort(orderByReceivedAtDesc);
        this.stored = true;
        this.totalCount = value.ScannedCount;
        return of(this.items);
      })
    );
  }*/
}
