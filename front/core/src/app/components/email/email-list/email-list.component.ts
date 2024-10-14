import { CommonModule } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Email, EmailService } from '../../../services/email/email.service';
import { SignoutComponent } from "../../auth/signout/signout.component";
import { forkJoin } from 'rxjs';


@Component({
    selector: 'app-email-list',
    standalone: true,
    imports: [ CommonModule, FormsModule, SignoutComponent ],
    templateUrl: './email-list.component.html',
    styleUrl: './email-list.component.scss',
})
export class EmailListComponent {
  @ViewChild('checkboxTable', { static: true }) checkboxTable!: ElementRef;

  protected message: string;
  protected emails: Email[];
  protected stored: boolean;
  protected hasNext: boolean;
  protected actions: any[];
  protected selectedAction: string;
  protected selectedMessageIds: string[];
  protected bulkRequesting: boolean;

  constructor(
    private emailService: EmailService,
    private router: Router,
  ) {
    this.message = 'Request emails...';
    this.emails = [];
    this.stored = false;
    this.hasNext = false;
    this.actions = [
      { value: 'bulkRead', label: '選択したメールを既読にする' },
      { value: 'bulkDelete', label: '選択したメールを削除する' },
    ];
    this.selectedAction = 'bulkRead';
    this.selectedMessageIds = [];
    this.bulkRequesting = false;


    this.emailService.list$().subscribe(this.handleList.bind(this));
  }

  handleList(emails: Email[]): void {
    this.message = emails.length <= 0 ? 'No message.' : '';
    this.emails = emails;
    this.stored = this.emailService.stored;
    this.hasNext = this.emailService.hasNext;
  }

  toggleAllCheckboxes($event: any): void {
    const checkboxes: NodeListOf<HTMLInputElement> = this.checkboxTable.nativeElement.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
      checkbox.checked = $event.target.checked;
      checkbox.dispatchEvent(new Event('change')); // 既存の (change) イベントを発火させる
    });
  }

  handleActionChanged($event: any) {
    this.selectedAction = $event.target.value;
    console.log('Selected action:', this.selectedAction);
  }

  handleBulkAction($event: any): void {
    $event.preventDefault(false);
    if (this.selectedMessageIds.length <= 0 || this.bulkRequesting) {
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

  handleCheckboxChanged($event: any): void {
    $event.preventDefault(false);
    const messageId = $event.target.value;
    if (!$event.target.checked) {
      this.selectedMessageIds = this.selectedMessageIds.filter(id => id !== messageId);
      return;
    }
    if (!this.selectedMessageIds.includes(messageId)) {
      this.selectedMessageIds.push(messageId);
    }
  }

  bulkRead(): void {
    this.message = 'Reading emails...';
    const readRequests = this.selectedMessageIds.map((messageId: string) => {
      return this.emailService.retrieve$(messageId);
    });
    forkJoin(readRequests).subscribe(() => {
      this.selectedMessageIds.length = 0;
      this.message = 'Read completed.';
    });
  }

  bulkDelete(): void {
    this.message = 'Deleting emails...';
    const deleteRequests = this.selectedMessageIds.map((messageId: string) => {
      return this.emailService.delete$(messageId);
    });
    forkJoin(deleteRequests).subscribe(() => {
      this.selectedMessageIds.length = 0;
      this.message = 'Delete completed.';
    });
  }

  listNext(): void {
    this.message = 'Request emails...';
    this.emailService.listNext$().subscribe(this.handleList.bind(this));
  }

  toDetail(messageId: string): void {
    this.router.navigate([`/emails/${messageId}`]);
  }
}
