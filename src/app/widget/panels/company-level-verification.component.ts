import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { LoginResult } from '../../model/generated-models';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';

@Component({
	selector: 'company-level-verification',
	templateUrl: 'company-level-verification.component.html',
	styleUrls: [
		'../../../assets/payment.scss',
		'../../../assets/button.scss',
		'../../../assets/text-control.scss',
		'../../../assets/auth.scss'
	]
})
export class CompanyLevelVerificationComponent implements OnInit, OnDestroy{
    @Input() buttonTitle = 'SEND';
    @Input() levelName = '';
    @Input() errorMessage = '';
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    @Output() done = new EventEmitter<LoginResult>();

    complete = false;
    companyNameControl: AbstractControl | null = null;
    showBack = false;

    private subscriptions: Subscription = new Subscription();

    infoForm = this.formBuilder.group({
    	companyName: ['', { validators: [], updateOn: 'change' }]
    });

    companyNameErrorMessages: { [key: string]: string; } = {
    	['required']: 'Please specify your company name'
    };

    constructor(
    	private auth: AuthService,
    	private errorHandler: ErrorService,
    	private formBuilder: UntypedFormBuilder) {
    	this.companyNameControl = this.infoForm.get('companyName');
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    ngOnInit(): void {
    	this.progressChange.emit(false);
    	this.setFields();
    }

    private setFields(): void {
    	const user = this.auth.user;
    	if (user) {
    		this.companyNameControl?.setValue(user.companyName);
    	} else {
    		this.companyNameControl?.setValue('');
    	}
    	this.companyNameControl?.updateValueAndValidity();
    }

    onSubmit(): void {
    	if (this.infoForm.valid) {
    		this.progressChange.emit(true);

    		this.subscriptions.add(
    			this.auth.companyLevelVerification(
    				this.companyNameControl?.value as string,
    				this.levelName
    			).subscribe(({ data }) => {
    				this.progressChange.emit(false);
    				this.complete = true;
    			}, (error) => {
    				this.showBack = true;
    				this.complete = true;
    				this.progressChange.emit(false);
    				this.error.emit(this.errorHandler.getError(error.message, 'Incorrect сщьзфтн data'));
    			})
    		);
    	}
    }
}
