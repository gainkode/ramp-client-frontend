import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { ApiSecretDialogBox } from 'components/dialogs/api-secret-box.dialog';
import { DeleteDialogBox } from 'components/dialogs/delete-box.dialog';
import { ApiKeyItem } from 'model/apikey.model';
import { ApiKeyListResult, ApiKeySecret } from 'model/generated-models';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';

@Component({
    selector: 'app-profile-api-keys-settings',
    templateUrl: './apikeys.component.html',
    styleUrls: [
        '../../../../assets/menu.scss',
        '../../../../assets/button.scss',
        '../../../../assets/profile.scss',
        './apikeys.component.scss'
    ]
})
export class ProfileApiKeysSettingsComponent implements OnInit, OnDestroy {
    @ViewChild(MatSort) sort!: MatSort;
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    keys: ApiKeyItem[] = [];
    keyCount = 0;
    pageCounts = [25, 50, 100];
    pageSize = 25;
    pageIndex = 0;
    sortedField = 'created';
    sortedDesc = true;
    displayedColumns: string[] = [
        'title', 'created', 'remove'
    ];

    private pSubscriptions: Subscription = new Subscription();

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private dataService: ProfileDataService,
        private router: Router,
        public dialog: MatDialog) {
    }

    ngOnInit(): void {
        this.getApiKeys();
    }

    ngOnDestroy(): void {
        this.pSubscriptions.unsubscribe();
    }

    private getSortedField(): string {
        let result = this.sortedField;
        if (this.sortedField === 'title') {
            result = 'apiKeyId';
        }
        return result;
    }

    private getApiKeys(): void {
        this.error.emit('');
        this.keys = [];
        this.error.emit('');
        const tiersData = this.dataService.getMyApiKeys(
            this.pageIndex,
            this.pageSize,
            this.getSortedField(),
            this.sortedDesc).valueChanges.pipe(take(1));
        this.progressChange.emit(true);
        this.pSubscriptions.add(
            tiersData.subscribe(({ data }) => {
                this.progressChange.emit(false);
                const dataList = data.myApiKeys as ApiKeyListResult;
                if (dataList !== null) {
                    this.keyCount = dataList?.count ?? 0;
                    if (this.keyCount > 0 && dataList?.list) {
                        this.keys = dataList.list.map(val => new ApiKeyItem(val));
                    }
                }
            }, (error) => {
                this.progressChange.emit(false);
                if (this.errorHandler.getCurrentError() === 'auth.token_invalid' || error.message === 'Access denied') {
                    this.router.navigateByUrl('/');
                } else {
                    this.error.emit(this.errorHandler.getError(error.message, 'Unable to get API keys'));
                }
            })
        );
    }

    handlePage(event: PageEvent): PageEvent {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.getApiKeys();
        return event;
    }

    createKey(): void {
        this.error.emit('');
        this.progressChange.emit(true);
        const createKeyData$ = this.dataService.createMyApiKey();
        this.pSubscriptions.add(
            createKeyData$.subscribe(({ data }) => {
                this.progressChange.emit(false);
                const apiKeyData = data.createMyApiKey as ApiKeySecret;
                this.getApiKeys();
                this.dialog.open(ApiSecretDialogBox, {
                    width: '500px',
                    data: {
                        title: 'New API key has been created',
                        message: apiKeyData.secret,
                        button: apiKeyData.apiKeyId
                    }
                });
            }, (error) => {
                this.progressChange.emit(false);
                this.error.emit(this.errorHandler.getError(error.message, 'Unable to craete API key'));
            })
        );
    }

    removeApiKey(item: ApiKeyItem): void {
        const dialogRef = this.dialog.open(DeleteDialogBox, {
            width: '402px',
            data: {
                title: '',
                message: `You are going to delete API key ${item.title}. Please confirm.`,
                button: 'DELETE'
            }
        });
        this.pSubscriptions.add(
            dialogRef.afterClosed().subscribe(result => {
                if (result === true) {
                    this.removeApiKeyConfirmed(item.title);
                }
            })
        );
    }

    private removeApiKeyConfirmed(apiKey: string): void {
        this.error.emit('');
        this.progressChange.emit(true);
        const deleteKeyData$ = this.dataService.deleteMyApiKey(apiKey);
        this.pSubscriptions.add(
            deleteKeyData$.subscribe(({ data }) => {
                this.progressChange.emit(false);
                this.getApiKeys();
            }, (error) => {
                this.progressChange.emit(false);
                this.error.emit(this.errorHandler.getError(error.message, 'Unable to delete API key'));
            })
        );
    }
}
