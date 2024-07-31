import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { CommonTargetValue } from 'model/common.model';
import { DeviceItem } from 'model/user.model';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-device-details',
	templateUrl: 'device-details.component.html',
	styleUrls: ['device-details.component.scss']
})
export class AdminDeviceDetailsComponent implements OnDestroy {
  @Input() permission = 0;
  @Input() set device(val: DeviceItem | undefined) {
  	this.deviceData = val;
  	if (val?.country) {
  		this.country = new CommonTargetValue();
  		this.country.id = val?.country?.code3 ?? '';
  		this.country.title = val?.country?.name ?? '';
  		this.country.imgClass = 'country-flag';
  		this.country.imgSource = `assets/svg-country-flags/${val?.country?.code2.toLowerCase()}.svg`;
  	}
  }
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private deleteDialog?: NgbModalRef;
  private subscriptions: Subscription = new Subscription();

  deleteInProgress = false;
  errorMessage = '';
  deviceData: DeviceItem | undefined = undefined;
  country: CommonTargetValue | null = null;

  constructor(
  	private router: Router,
  	private auth: AuthService,
  	private modalService: NgbModal,
  	private adminService: AdminDataService) { }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  private deleteDeviceConfirmed(): void {
  	this.deleteInProgress = true;
  	const requestData = this.adminService.deleteDevice(this.deviceData?.id ?? '');
  	this.subscriptions.add(
  		requestData.subscribe(() => {
  			this.deleteInProgress = false;
  			this.save.emit();
  		}, (error) => {
  			this.errorMessage = error;
  			this.deleteInProgress = false;
  			if (this.auth.token === '') {
  				void this.router.navigateByUrl('/');
  			}
  		})
  	);
  }

  onDelete(content: any): void {
  	this.deleteDialog = this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  }

  onClose(): void {
  	this.close.emit();
  }

  onConfirmDelete(): void {
  	if (this.deleteDialog) {
  		this.deleteDialog.close('');
  		this.deleteDeviceConfirmed();
  	}
  }
}
