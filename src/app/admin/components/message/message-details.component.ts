import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MessageItem } from 'model/message.model';
import { finalize, tap } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-message-details',
	templateUrl: 'message-details.component.html',
	styleUrls: ['message-details.component.scss', '../../assets/scss/_validation.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminMessageDetailsComponent {
  @Input() permission = 0;
  @Input() message: MessageItem | undefined = undefined;
  @Output() close = new EventEmitter();
  resendInProgress = false;

  constructor(
  	private router: Router,
  	private auth: AuthService,
		private _snackBar: MatSnackBar,
		private cdr: ChangeDetectorRef,
  	private adminService: AdminDataService) { }

  resend(): void {
  	this.resendInProgress = true;

		this.adminService.resendAdminNotification(this.message?.id ?? '').pipe(
      finalize(() => {
				this.resendInProgress = false;
				this.cdr.detectChanges();
			}),
      tap({
        next: () => this._snackBar.open('Notification resent successfully', null, { duration: 5000 }),
        error: (error) => {
					this._snackBar.open('Failed to resend notification ' +  error, null, { duration: 5000 });
					
          if (this.auth.token === '') {
            void this.router.navigateByUrl('/');
          }
        }
      })
    ).subscribe();
  }
}
