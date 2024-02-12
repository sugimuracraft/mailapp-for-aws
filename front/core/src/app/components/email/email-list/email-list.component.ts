import { Component } from '@angular/core';
import { Email, EmailService } from '../../../services/email/email.service';

@Component({
  selector: 'app-email-list',
  templateUrl: './email-list.component.html',
  styleUrl: './email-list.component.scss'
})
export class EmailListComponent {
  protected emails: Email[];

  constructor(
    private emailService: EmailService,
  ) {
    this.emails = [];

    this.emailService.list$().subscribe(this.handleList.bind(this));
  }

  handleList(value: Email[]): void {
    this.emails = this.emails.concat(value);
  }
}
