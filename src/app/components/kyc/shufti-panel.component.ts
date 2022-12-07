import { Component, Input, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { KycProvider } from '../../model/generated-models';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
    selector: 'app-shufti-panel',
    styleUrls: ['kyc-panel.component.scss'],
    templateUrl: 'shufti-panel.component.html'
})
export class ShuftiPanelComponent implements OnInit, OnDestroy {
    @Input() url: string = '';
    @Input() completedWhenVerified: boolean = false;
    @Output() completed = new EventEmitter();
    @Output() onReject = new EventEmitter();
    @Output() onError = new EventEmitter<string>();

    private pSubscriptions: Subscription = new Subscription();

    constructor(
        public dialog: MatDialog,
        private auth: AuthService,
        private notification: NotificationService) {
    }

    ngOnInit(): void {
        if (this.auth.user?.kycProvider === KycProvider.Shufti) {
            // this.startKycNotifications();
        }
    }

    ngOnDestroy(): void {
        this.pSubscriptions?.unsubscribe();
    }
}
