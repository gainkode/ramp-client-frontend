import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'src/app/services/admin-data.service';
import { NotificationItem } from 'src/app/model/notification.model';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-notification-details',
  templateUrl: 'notification-details.component.html',
  styleUrls: ['notification-details.component.scss', '../../assets/scss/_validation.scss']
})
export class AdminNotificationDetailsComponent implements OnDestroy {
  @Input() permission = 0;
  @Input() message: NotificationItem | undefined = undefined;
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();

  resendInProgress = false;
  errorMessage = '';

  constructor(
    private router: Router,
    private auth: AuthService,
    private adminService: AdminDataService) { }

    ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
    }

  resend(): void {
    this.resendInProgress = true;
    const requestData$ = this.adminService.resendAdminNotification(this.message?.id ?? '');
    this.subscriptions.add(
      requestData$.subscribe(({ data }) => {
        this.resendInProgress = false;
      }, (error) => {
        this.resendInProgress = false;
        this.errorMessage = error;
        if (this.auth.token === '') {
          this.router.navigateByUrl('/');
        }
      })
    );
  }
}
