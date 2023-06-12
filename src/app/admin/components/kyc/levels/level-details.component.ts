import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';
import { KycLevel } from 'model/identification.model';
import { UserTypeList } from 'model/payment.model';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-level-details',
	templateUrl: 'level-details.component.html',
	styleUrls: ['level-details.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminLevelDetailsComponent implements OnDestroy {
  @Input() permission = 0;
  @Input()
  set currentLevel(level: KycLevel | undefined) {
  	this.setFormData(level);
  	this.settingsId = (level) ? level?.id : '';
  	this.createNew = (this.settingsId === '');
  }

  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();
  private removeDialog: NgbModalRef | undefined = undefined;
  private settingsId = '';

  submitted = false;
  createNew = false;
  saveInProgress = false;
  deleteInProgress = false;
  errorMessage = '';
  userTypeOptions = UserTypeList;

  form = this.formBuilder.group({
  	id: [''],
  	name: ['', { validators: [Validators.required], updateOn: 'change' }],
  	description: [''],
  	userType: ['', { validators: [Validators.required], updateOn: 'change' }],
  	level: ['', { validators: [Validators.required], updateOn: 'change' }],
  	flow: ['', { validators: [Validators.required], updateOn: 'change' }]
  });

  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private router: Router,
  	private modalService: NgbModal,
  	private auth: AuthService,
  	private adminService: AdminDataService) {

  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  setFormData(level?: KycLevel): void {
  	if (level !== null) {
  		this.form.get('id')?.setValue(level?.id);
  		this.form.get('name')?.setValue(level?.name);
  		this.form.get('description')?.setValue(level?.description);
  		this.form.get('userType')?.setValue(level?.userType);
  		this.form.get('level')?.setValue(level?.levelData.value);
  		this.form.get('flow')?.setValue(level?.flowData.value);
  	} else {
  		this.form.get('id')?.setValue('');
  		this.form.get('name')?.setValue('');
  		this.form.get('description')?.setValue('');
  		this.form.get('userType')?.setValue('');
  		this.form.get('level')?.setValue('');
  		this.form.get('flow')?.setValue([]);
  	}
  }

  setLevelData(): KycLevel {
  	const data = new KycLevel(null);
  	data.name = this.form.get('name')?.value;
  	data.description = this.form.get('description')?.value;
  	data.userType = this.form.get('userType')?.value;
  	data.levelData.value = this.form.get('level')?.value;
  	data.flowData.value = this.form.get('flow')?.value;
  	data.id = this.form.get('id')?.value;
  	return data;
  }

  onSubmit(): void {
  	this.submitted = true;
  	if (this.form.valid) {
  		this.saveLevel(this.setLevelData());
  	}
  }

  deleteLevel(content: any): void {
  	this.removeDialog = this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  	this.subscriptions.add(
  		this.removeDialog.closed.subscribe(val => {
  			this.deleteLevelConfirmed(this.settingsId ?? '');
  		})
  	);
  }

  private saveLevel(level: KycLevel): void {
  	this.errorMessage = '';
  	this.saveInProgress = true;
  	const requestData$ = this.adminService.saveKycLevelSettings(level, this.createNew);
  	this.subscriptions.add(
  		requestData$.subscribe(({ data }) => {
  			this.saveInProgress = false;
  			this.save.emit();
  		}, (error) => {
  			this.saveInProgress = false;
  			this.errorMessage = error;
  			if (this.auth.token === '') {
  				this.router.navigateByUrl('/');
  			}
  		})
  	);
  }

  deleteLevelConfirmed(id: string): void {
  	this.errorMessage = '';
  	this.saveInProgress = true;
  	const requestData$ = this.adminService.deleteKycLevelSettings(id);
  	this.subscriptions.add(
  		requestData$.subscribe(({ data }) => {
  			this.saveInProgress = false;
  			this.save.emit();
  		}, (error) => {
  			this.saveInProgress = false;
  			this.errorMessage = error;
  			if (this.auth.token === '') {
  				this.router.navigateByUrl('/');
  			}
  		})
  	);
  }
}
