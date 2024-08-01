import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { NotificationItem } from 'model/notification.model';
import { finalize, tap } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-notification-details',
	templateUrl: 'notification-details.component.html',
	styleUrls: ['notification-details.component.scss', '../../assets/scss/_validation.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminNotificationDetailsComponent {
  @Input() message: NotificationItem | undefined = undefined;
  @Output() close = new EventEmitter();
  resendInProgress = false;

  constructor(
		private _snackBar: MatSnackBar,
  	private router: Router,
		private cdr: ChangeDetectorRef,
    private auth: AuthService,
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
