import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

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

  constructor(
    private emailService: EmailService,
  ) {
    this.email = null;
  }

  @Input()
  set id(messageId: string) {
    this.emailService.retrieve$(messageId).subscribe(this.handleRetrieveEmail.bind(this));
  }

  handleRetrieveEmail = (email: Email) => {
    this.email = email;
  }
}
