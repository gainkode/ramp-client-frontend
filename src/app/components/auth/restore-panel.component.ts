import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ErrorService } from '../../services/error.service';
import { Validators, UntypedFormBuilder, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
	selector: 'app-restore-panel',
	templateUrl: 'restore-panel.component.html',
	styleUrls: ['../../../assets/text-control.scss', '../../../assets/auth.scss']
})
export class RestorePanelComponent implements OnDestroy {
    @Input() errorMessage = '';
    @Input() userTypeSection = 'personal';
    @Output() error = new EventEmitter<string>();
    @Output() progressChange = new EventEmitter<boolean>();
    
    private subscriptions: Subscription = new Subscription();

    emailErrorMessages: { [key: string]: string; } = {
    	['pattern']: 'Email is not valid',
    	['required']: 'Email is required'
    };

    restoreForm = this.formBuilder.group({
    	email: [,
    		{
    			validators: [
    				Validators.required,
    				Validators.pattern(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    			], updateOn: 'change'
    		}
    	]
    });

    constructor(
    	private auth: AuthService,
    	private errorHandler: ErrorService,
    	private formBuilder: UntypedFormBuilder,
    	public router: Router) { }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    get emailField(): AbstractControl | null {
    	return this.restoreForm.get('email');
    }

    onSubmit(): void {
    	this.registerError('');
    	if (this.restoreForm.valid) {
    		this.onProgress(true);
    		this.subscriptions.add(
    			this.auth.forgotPassword(this.restoreForm.get('email')?.value).subscribe(({ data }) => {
    				this.onProgress(false);
    				void this.router.navigateByUrl(`/${this.userTypeSection}/auth/success/restore`);
    			}, (error) => {
    				this.onProgress(false);
    				this.registerError(this.errorHandler.getError(error.message, 'Unable to restore password'));
    			})
    		);
    	}
    }

    registerError(error: string): void {
    	this.error.emit(error);
    }

    onProgress(visible: boolean): void {
    	this.progressChange.emit(visible);
    }
}
