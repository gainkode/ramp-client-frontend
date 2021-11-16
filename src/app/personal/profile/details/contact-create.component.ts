import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProfileItemContainer } from 'src/app/model/profile-item.model';
import { ContactItem } from 'src/app/model/user.model';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-contact-create',
    templateUrl: './contact-create.component.html',
    styleUrls: ['../../../../assets/button.scss', '../../../../assets/details.scss', '../../../../assets/text-control.scss']
})
export class PersonalContactCreateComponent implements OnInit, OnDestroy {
    @Output() onComplete = new EventEmitter<ProfileItemContainer>();

    errorMessage = '';
    inProgress = false;
    contact: ContactItem | undefined = undefined;
    createForm = this.formBuilder.group({
        userName: ['', { validators: [Validators.required], updateOn: 'change' }],
        email: [
            '',
            {
                validators: [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$'),
                ],
                updateOn: 'change',
            }
        ]
    });
    emailErrorMessages: { [key: string]: string; } = {
        ['required']: 'Email is required',
        ['pattern']: 'Email format is invalid'
    };
    userNameErrorMessages: { [key: string]: string; } = {
        ['required']: 'User name is required'
    };

    private subscriptions: Subscription = new Subscription();

    constructor(
        private formBuilder: FormBuilder,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService) { }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }

    get userNameField(): AbstractControl | null {
        return this.createForm.get('userName');
    }

    get emailField(): AbstractControl | null {
        return this.createForm.get('email');
    }

    private createContact(email: string, userName: string): void {
        this.errorMessage = '';
        this.inProgress = true;
        this.subscriptions.add(
            this.profileService.saveContact('', userName, email).subscribe(({ data }) => {
                this.inProgress = false;
                console.log(data);

                // const item = new ProfileItemContainer();
                // item.container = ProfileItemContainerType.Contact;
                // item.action = ProfileItemActionType.Create;
                // item.contact = this.contact;
                // this.onComplete.emit(item);

            }, (error) => {
                this.inProgress = false;
                this.errorMessage = this.errorHandler.getError(error.message, `Unable to create a new wallet`);
            })
        );
    }

    submit(): void {
        if (this.createForm.valid) {
            this.createContact(this.emailField?.value, this.userNameField?.value);
        }
    }
}