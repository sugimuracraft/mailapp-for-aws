import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import PostalMime from 'postal-mime';

import { Email, EmailService } from '../../../services/email/email.service';


@Component({
  standalone: true,
  selector: 'app-email-detail',
  imports: [ CommonModule ],
  templateUrl: './email-detail.component.html',
  styleUrl: './email-detail.component.scss',
})
export class EmailDetailComponent {
  protected email: Email | null;
  protected parsedBody: any;

  constructor(
    private emailService: EmailService,
  ) {
    this.email = null;
    this.parsedBody = null;
  }

  @Input()
  set id(messageId: string) {
    this.emailService.retrieve$(messageId).subscribe(this.handleRetrieveEmail.bind(this));
  }

  handleRetrieveEmail = async (email: Email) => {
    this.email = email;
    if (this.email.body) {
      const parser = new PostalMime();
      this.parsedBody = await parser.parse(this.email.body);
    }
  }
}
