import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Email, EmailService } from '../../../services/email/email.service';
import { SignoutComponent } from '../../auth/signout/signout.component';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-email-list',
  imports: [CommonModule, FormsModule, SignoutComponent],
  templateUrl: './email-list.component.html',
  styleUrl: './email-list.component.scss',
})
export class EmailListComponent {
  @ViewChild('checkboxTable', { static: true }) checkboxTable!: ElementRef;

  protected message: string;
  protected emails: Email[];
  protected emailState: Record<string, boolean>;
  protected stored: boolean;
  protected hasNext: boolean;
  protected actions: any[];
  protected selectedAction: string;
  protected bulkRequesting: boolean;

  constructor(
    private emailService: EmailService,
    private router: Router,
  ) {
    this.message = 'Request emails...';
    this.emails = [];
    this.emailState = {};
    this.stored = false;
    this.hasNext = false;
    this.actions = [
      { value: 'bulkRead', label: '選択したメールを既読にする' },
      { value: 'bulkDelete', label: '選択したメールを削除する' },
    ];
    this.selectedAction = 'bulkRead';
    this.bulkRequesting = false;

    this.emailService.list$().subscribe(this.handleList.bind(this));
  }

  private handleList(emails: Email[]): void {
    this.message = emails.length <= 0 ? 'No message.' : '';
    this.emails = emails;
    this.emails.forEach((email) => {
      this.emailState[email.messageId] = this.emailState[email.messageId] || false;
    });
    this.stored = this.emailService.stored;
    this.hasNext = this.emailService.hasNext;
  }

  protected toggleCheckbox(email: Email, $event: any): void {
    this.emailState[email.messageId] = $event.target.checked;
  }

  protected toggleAllCheckboxes($event: any): void {
    for (const messageId in this.emailState) {
      this.emailState[messageId] = $event.target.checked;
    }
  }

  protected areAllChecked(): boolean {
    return this.emails.every((email) => this.emailState[email.messageId]);
  }

  protected isChecked(): boolean {
    return Object.values(this.emailState).some((value) => value);
  }

  private getCheckedMessageIds(): string[] {
    return Object.entries(this.emailState)
      .filter(([_, checked]) => checked) // 値が true のものをフィルタリング
      .map(([messageId, _]) => messageId); // キー (messageId) を取得
  }

  protected handleActionChanged($event: any) {
    this.selectedAction = $event.target.value;
    console.log('Selected action:', this.selectedAction);
  }

  protected handleBulkAction($event: any): void {
    $event.preventDefault(false);
    if (!this.isChecked() || this.bulkRequesting) {
      return;
    }
    switch (this.selectedAction) {
      case 'bulkRead':
        this.bulkRead();
        break;
      case 'bulkDelete':
        this.bulkDelete();
        break;
    }
  }

  private bulkRead(): void {
    this.message = 'Reading emails...';
    const checkedMessageIds = this.getCheckedMessageIds();
    const readRequests = checkedMessageIds.map((messageId) => this.emailService.retrieve$(messageId));
    forkJoin(readRequests).subscribe(() => {
      this.emails.forEach((email) => {
        // update emails.
        if (checkedMessageIds.includes(email.messageId)) {
          email.status = 'read';
        }
      });
      this.message = 'Read completed.';
    });
  }

  private bulkDelete(): void {
    this.message = 'Deleting emails...';
    const checkedMessageIds = this.getCheckedMessageIds();
    const deleteRequests = checkedMessageIds.map((messageId) => this.emailService.delete$(messageId));
    forkJoin(deleteRequests).subscribe(() => {
      // delete from emails.
      this.emails = this.emails.filter((email) => !checkedMessageIds.includes(email.messageId));
      // delete from emailState.
      checkedMessageIds.forEach((messageId) => {
        delete this.emailState[messageId];
      });
      this.message = 'Delete completed.';
    });
  }

  protected listNext(): void {
    this.message = 'Request emails...';
    this.emailService.listNext$().subscribe(this.handleList.bind(this));
  }

  protected toDetail(messageId: string): void {
    this.router.navigate([`/emails/${messageId}`]);
  }
}
