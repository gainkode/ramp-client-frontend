import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KycProvider } from 'model/generated-models';
import { Subscription } from 'rxjs';
import { AuthService } from 'services/auth.service';
import { NotificationService } from 'services/notification.service';

@Component({
	selector: 'app-autentix-panel',
	templateUrl: './autentix-panel.component.html',
	styleUrls: ['./autentix-panel.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class AutentixPanelComponent implements OnInit, OnDestroy {
	@Input() url = '';
    @Input() completedWhenVerified = false;
    @Output() completed = new EventEmitter();
    @Output() onReject = new EventEmitter();
    @Output() onError = new EventEmitter<string>();

    private pSubscriptions: Subscription = new Subscription();
    urlPolicy = '';

    constructor(
    	public dialog: MatDialog,
    	private auth: AuthService,
    	private notification: NotificationService) {
    }

    ngOnInit(): void {
    	this.urlPolicy = `frame-src ${this.url}`;
    	if (this.auth.user?.kycProvider === KycProvider.Shufti) {
    		// this.startKycNotifications();
    	}
    }

    ngOnDestroy(): void {
    	this.pSubscriptions?.unsubscribe();
    }
}
