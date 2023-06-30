import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { DeleteDialogBox } from 'components/dialogs/delete-box.dialog';
import { UserDeviceListResult } from 'model/generated-models';
import { DeviceItem } from 'model/user.model';
import { AuthService } from 'services/auth.service';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';

@Component({
	selector: 'app-profile-white-ip-list',
	templateUrl: './ip-list.component.html',
	styleUrls: [
		'../../../../assets/menu.scss',
		
		'../../../../assets/profile.scss',
		'./ip-list.component.scss'
	]
})
export class ProfileIpListSettingsComponent implements OnInit, OnDestroy {
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();

    details = false;
    selectedDevice?: DeviceItem;
    devices: DeviceItem[] = [];
    deviceCount = 0;
    displayedColumns: string[] = [
    	'country',
    	'browser',
    	'device',
    	'created',
    	'remove'
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
    	this.getIpList();
    }

    ngOnDestroy(): void {
    	this.pSubscriptions.unsubscribe();
    }

    private getIpList(): void {
    	this.error.emit('');
    	this.devices = [];
    	this.error.emit('');
    	const tiersData = this.dataService.getMyDevices().valueChanges.pipe(take(1));
    	this.progressChange.emit(true);
    	this.pSubscriptions.add(
    		tiersData.subscribe(({ data }) => {
    			this.progressChange.emit(false);
    			const dataList = data.myDevices as UserDeviceListResult;
    			if (dataList !== null) {
    				this.deviceCount = dataList?.count ?? 0;
    				if (this.deviceCount > 0 && dataList?.list) {
    					this.devices = dataList.list.map(val => new DeviceItem(val));
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

    onRowSelected(selectedItem: DeviceItem): void {
    	this.selectedDevice = selectedItem;
    	this.details = true;
    }

    removeApiKey(item: DeviceItem): void {
    	const deviceName = (item.device === '') ? 'unknown device' : item.device;
    	const dialogRef = this.dialog.open(DeleteDialogBox, {
    		width: '402px',
    		data: {
    			title: '',
    			message: `You are going to delete confirmation for ${deviceName}. Please confirm.`,
    			button: 'DELETE'
    		}
    	});
    	this.pSubscriptions.add(
    		dialogRef.afterClosed().subscribe(result => {
    			if (result === true) {
    				this.removeDeviceConfirmed(item.id);
    			}
    		})
    	);
    }

    private removeDeviceConfirmed(deviceId: string): void {
    	this.error.emit('');
    	this.progressChange.emit(true);
    	const deleteKeyData$ = this.dataService.deleteMyDevice(deviceId);
    	this.pSubscriptions.add(
    		deleteKeyData$.subscribe(({ data }) => {
    			this.progressChange.emit(false);
    			this.getIpList();
    		}, (error) => {
    			this.progressChange.emit(false);
    			this.error.emit(this.errorHandler.getError(error.message, 'Unable to delete device'));
    		})
    	);
    }
}
