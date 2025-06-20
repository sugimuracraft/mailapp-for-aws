import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';

import { Email, EmailService } from '../../../services/email/email.service';
import { SignoutComponent } from '../../auth/signout/signout.component';
import { forkJoin } from 'rxjs';

interface EmailWithCheckState extends Email {
  checked: boolean;
}

@Component({
  selector: 'app-email-list',
  imports: [
    CommonModule,
    FormsModule,
    SignoutComponent,
    MatCheckboxModule,
    MatTableModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './email-list.component.html',
  styleUrl: './email-list.component.scss',
})
export class EmailListComponent implements OnInit {
  @ViewChild('checkboxTable', { static: true }) checkboxTable!: ElementRef;

  protected snackbar: MatSnackBar;
  protected snackbarRef: MatSnackBarRef<TextOnlySnackBar> | null;
  protected emails: EmailWithCheckState[];
  protected stored: boolean;
  protected hasNext: boolean;
  protected actions: any[];
  protected selectedAction: string;
  protected bulkRequesting: boolean;
  protected displayedColumns: string[];

  constructor(
    private emailService: EmailService,
    private router: Router,
  ) {
    this.snackbar = inject(MatSnackBar);
    this.snackbarRef = null;
    this.emails = [];
    this.stored = false;
    this.hasNext = false;
    this.actions = [
      { value: 'bulkRead', label: '選択したメールを既読にする' },
      { value: 'bulkDelete', label: '選択したメールを削除する' },
    ];
    this.selectedAction = 'bulkRead';
    this.bulkRequesting = false;
    this.displayedColumns = ['select', 'from', 'subject', 'receivedAt'];
  }

  ngOnInit(): void {
    this.snackbarRef = this.snackbar.open('Request emails...');
    this.emailService.list$().subscribe(this.handleList.bind(this));
  }

  private handleList(emails: Email[]): void {
    if (this.snackbarRef) {
      this.snackbarRef.dismiss();
    }
    if (emails.length <= 0) {
      this.snackbar.open('No message.', 'OK', {'duration': 3000});
    }
    this.emails = emails.map((email) => {
      return {...email, checked: false}
    });
    this.stored = this.emailService.stored;
    this.hasNext = this.emailService.hasNext;
  }

  protected toggleCheckbox(email: EmailWithCheckState, $event: any): void {
    console.log("check toggleCheckbox");
    console.log($event);
    email.checked = $event.checked;
  }

  protected toggleAllCheckboxes($event: any): void {
    this.emails = this.emails.map((email) => {
      return {...email, checked: $event.checked};
    });
  }

  protected areAllChecked(): boolean {
    return this.emails.every((email) => email.checked);
  }

  protected isChecked(): boolean {
    return this.emails.some((email) => email.checked);
  }

  private getCheckedMessageIds(): string[] {
    return this.emails.filter((email) => email.checked).map((email) => email.messageId);
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
    this.snackbarRef = this.snackbar.open('Reading emails...');
    const checkedMessageIds = this.getCheckedMessageIds();
    const readRequests = checkedMessageIds.map((messageId) => this.emailService.retrieve$(messageId));
    forkJoin(readRequests).subscribe(() => {
      this.emails.forEach((email) => {
        // update emails.
        if (checkedMessageIds.includes(email.messageId)) {
          email.status = 'read';
        }
      });
      if (this.snackbarRef) {
        this.snackbarRef.dismiss();
      }
      this.snackbar.open('Read completed.', 'OK', {duration: 3000});
    });
  }

  private bulkDelete(): void {
    this.snackbarRef = this.snackbar.open('Deleting emails...');
    const checkedMessageIds = this.getCheckedMessageIds();
    const deleteRequests = checkedMessageIds.map((messageId) => this.emailService.delete$(messageId));
    forkJoin(deleteRequests).subscribe(() => {
      // delete from emails.
      this.emails = this.emails.filter((email) => !checkedMessageIds.includes(email.messageId));
      if (this.snackbarRef) {
        this.snackbarRef.dismiss();
      }
      this.snackbar.open('Delete completed.', 'OK', {duration: 3000});
    });
  }

  protected listNext(): void {
    this.snackbarRef = this.snackbar.open('Request emails...');
    this.emailService.listNext$().subscribe(this.handleList.bind(this));
  }

  protected toDetail(messageId: string): void {
    this.router.navigate([`/emails/${messageId}`]);
  }
}
