import { Component } from '@angular/core';
import { Email, EmailService } from '../../../services/email/email.service';

@Component({
  selector: 'app-email-list',
  templateUrl: './email-list.component.html',
  styleUrl: './email-list.component.scss'
})
export class EmailListComponent {
  protected emails: Email[];
  protected stored: boolean;
  protected hasNext: boolean;

  constructor(
    private emailService: EmailService,
  ) {
    this.emails = [];
    this.stored = false;
    this.hasNext = false;

    this.emailService.list$().subscribe(this.handleList.bind(this));
  }

  handleList(value: Email[]): void {
    this.emails = value;
    this.stored = this.emailService.stored;
    this.hasNext = this.emailService.hasNext;
  }

  listNext(): void {
    this.emailService.listNext$().subscribe(this.handleList.bind(this));
  }
}
