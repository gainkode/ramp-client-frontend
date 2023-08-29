import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { MessageItem } from 'model/message.model';

@Component({
	selector: 'app-admin-message-details',
	templateUrl: 'message-details.component.html',
	styleUrls: ['message-details.component.scss', '../../assets/scss/_validation.scss']
})
export class AdminMessageDetailsComponent implements OnDestroy {
  @Input() permission = 0;
  @Input() message: MessageItem | undefined = undefined;
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
  				void this.router.navigateByUrl('/');
  			}
  		})
  	);
  }
}
