import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProfileItemActionType, ProfileItemContainer, ProfileItemContainerType } from 'model/profile-item.model';
import { ContactItem } from 'model/user.model';
import { ErrorService } from 'services/error.service';
import { ProfileDataService } from 'services/profile.service';

@Component({
	selector: 'app-profile-contact-details',
	templateUrl: './contact-details.component.html',
	styleUrls: ['../../../../assets/details.scss', '../../../../assets/text-control.scss']
})
export class ProfileContactDetailsComponent implements OnDestroy {
    @Input() contact: ContactItem | undefined;
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    editMode = false;
    deleteMode = false;
    inProgress = false;
    errorMessage = '';

    editForm = this.formBuilder.group({
    	displayName: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    private subscriptions: Subscription = new Subscription();

    constructor(
    	private formBuilder: UntypedFormBuilder,
    	private errorHandler: ErrorService,
    	private profileService: ProfileDataService) { }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    get displayNameField(): AbstractControl | null {
    	return this.editForm.get('displayName');
    }

    editName(): void {
    	if (this.contact) {
    		this.displayNameField?.setValue(this.contact.displayName);
    	}
    	this.editMode = true;
    }

    saveName(): void {
    	const val = this.displayNameField?.value;
    	if (val) {
    		this.errorMessage = '';
    		this.inProgress = true;
    		const request$ = this.profileService.saveMyContact(
    			this.contact?.id ?? '',
    			this.displayNameField?.value,
    			this.contact?.contactEmail ?? '',
    			'',
    			'');
    		this.subscriptions.add(
    			request$.subscribe(() => {
    				if (this.contact) {
    					this.contact.displayName = this.displayNameField?.value;
    				}
    				const item = new ProfileItemContainer();
    				item.container = ProfileItemContainerType.Contact;
    				item.action = ProfileItemActionType.Create;
    				item.contact = this.contact;
    				this.onComplete.emit(item);
    			}, (error) => {
    				this.inProgress = false;
    				this.errorMessage = this.errorHandler.getError(error.message, `Unable to change the contact name`);
    			})
    		);
    	}
    }

    receiveStart(): void {
    	const item = new ProfileItemContainer();
    	item.container = ProfileItemContainerType.Contact;
    	item.action = ProfileItemActionType.Redirect;
    	item.contact = this.contact;
    	item.meta = 'receive';
    	this.onComplete.emit(item);
    }

    sendStart(): void {
    	const item = new ProfileItemContainer();
    	item.container = ProfileItemContainerType.Contact;
    	item.action = ProfileItemActionType.Redirect;
    	item.contact = this.contact;
    	item.meta = 'send';
    	this.onComplete.emit(item);
    }

    requestDeleteContact(): void {
    	this.deleteMode = true;
    }

    deleteContact(): void {
    	this.errorMessage = '';
    	this.inProgress = true;
    	const request$ = this.profileService.deleteMyContact(this.contact?.id ?? '');
    	this.subscriptions.add(
    		request$.subscribe(({ data }) => {
    			this.inProgress = false;
    			if (data && data.deleteMyContact) {
    				const item = new ProfileItemContainer();
    				item.container = ProfileItemContainerType.Contact;
    				item.action = ProfileItemActionType.Remove;
    				item.contact = new ContactItem(null);
    				item.contact.id = this.contact?.id ?? '';
    				this.onComplete.emit(item);
    			}
    		}, (error) => {
    			this.inProgress = false;
    			this.errorMessage = this.errorHandler.getError(error.message, `Unable to remove the contact`);
    		})
    	);
    }

    cancelDelete(): void {
    	this.deleteMode = false;
    }
}