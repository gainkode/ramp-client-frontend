import { Component, EventEmitter, Input, OnDestroy, Output } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProfileItemActionType, ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { ContactItem } from 'src/app/model/user.model';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-contact-details',
    templateUrl: './contact-details.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/details.scss', '../../../../assets/text-control.scss']
})
export class PersonalContactDetailsComponent implements OnDestroy {
    @Input() contact: ContactItem | undefined;
    @Output() onError = new EventEmitter<string>();
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    editMode = false;
    deleteMode = false;
    inProgress = false;

    editForm = this.formBuilder.group({
        displayName: ['', { validators: [Validators.required], updateOn: 'change' }]
    });

    private subscriptions: Subscription = new Subscription();

    constructor(
        private formBuilder: FormBuilder,
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
            this.onError.emit('');
            this.inProgress = true;
            this.subscriptions.add(
                this.profileService.saveMyContact(
                    this.contact?.id ?? '',
                    this.displayNameField?.value,
                    this.contact?.contactEmail ?? '',
                    '',
                    '').subscribe(({ data }) => {
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
                        this.onError.emit(this.errorHandler.getError(error.message, `Unable to change the contact name`));
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
        this.onError.emit('');
        this.inProgress = true;
        this.subscriptions.add(
            this.profileService.deleteMyContact(this.contact?.id ?? '').subscribe(({ data }) => {
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
                this.onError.emit(this.errorHandler.getError(error.message, `Unable to remove the contact`));
            })
        );
    }

    cancelDelete(): void {
        this.deleteMode = false;
    }
}