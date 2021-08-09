import { Component, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ContactItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-contacts',
    templateUrl: './profile-contacts.component.html',
    styleUrls: ['./profile.scss', './profile-contacts.component.scss']
})
export class ProfileContactsComponent {
    @Output() changeEditMode = new EventEmitter<boolean>();
    private pShowDetails = false;
    private pContactsSubscription!: any;
    private pEditMode = false;
    inProgress = false;
    errorMessage = '';
    editorErrorMessage = '';
    createContact = false;
    selectedContact: ContactItem | null = null;
    contacts: ContactItem[] = [];
    displayedColumns: string[] = ['created', 'displayName', 'contactEmail', 'details'];

    get showDetailed(): boolean {
        return this.pShowDetails;
    }

    get editMode(): boolean {
        return this.pEditMode;
    }

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    ngOnInit(): void {
        const contactsData = this.profileService.getProfileContacts();
        if (contactsData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.inProgress = true;
            this.pContactsSubscription = contactsData.valueChanges.subscribe(({ data }) => {
                // const settings = data.getSettingsCost as SettingsCostListResult;
                // let itemCount = 0;
                // if (settings !== null) {
                //     itemCount = settings?.count as number;
                //     if (itemCount > 0) {
                //         this.schemes = settings?.list?.map((val) => new CostScheme(val)) as CostScheme[];
                //     }
                // }
                this.inProgress = false;
            }, (error) => {
                this.setEditMode(false);
                this.inProgress = false;
                if (this.auth.token !== '') {
                    this.errorMessage = this.errorHandler.getError(error.message, 'Unable to load list of contacts');
                } else {
                    this.router.navigateByUrl('/');
                }
            });
        }
    }

    ngOnDestroy(): void {
        const s: Subscription = this.pContactsSubscription;
        if (s !== undefined) {
            (this.pContactsSubscription as Subscription).unsubscribe();
        }
    }

    refresh(): void {
        const contactsData = this.profileService.getProfileContacts();
        if (contactsData !== null) {
            contactsData.refetch();
        }
    }

    private setEditMode(mode: boolean): void {
        this.pEditMode = mode;
        this.changeEditMode.emit(mode);
    }

    private isSelectedContact(contactId: string): boolean {
        let selected = false;
        if (this.selectedContact !== null) {
            if (this.selectedContact.id === contactId) {
                selected = true;
            }
        }
        return selected;
    }

    getDetailsIcon(contactId: string): string {
        if (this.createContact) {
            return 'lock';
        } else {
            return (this.isSelectedContact(contactId)) ? 'clear' : 'description';
        }
    }

    getDetailsTooltip(contactId: string): string {
        if (this.createContact) {
            return 'Save changes first';
        } else {
            return (this.isSelectedContact(contactId)) ? 'Hide details' : 'Change contact';
        }
    }

    private showEditor(contact: ContactItem | null, createNew: boolean, visible: boolean): void {
        this.pShowDetails = visible;
        if (visible) {
            this.selectedContact = contact;
            this.createContact = createNew;
            if (createNew) {
                this.setEditMode(true);
            }
        } else {
            this.selectedContact = null;
            this.setEditMode(false);
        }
    }

    toggleDetails(contact: ContactItem): void {
        let show = true;
        if (this.isSelectedContact(contact.id)) {
            show = false;
        }
        this.showEditor(contact, false, show);
    }

    createNewContact(): void {
        this.showEditor(null, true, true);
    }

    onEditorFormChanged(mode: boolean): void {
        this.setEditMode(mode);
    }

    onCancelEdit(): void {
        this.createContact = false;
        this.showEditor(null, false, false);
        this.setEditMode(false);
    }

    onDeleteScheme(id: string): void {
        this.editorErrorMessage = '';
        // const requestData = this.adminService.deleteCostSettings(id);
        // if (requestData === null) {
        //   this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        // } else {
        //   this.inProgress = true;
        //   requestData.subscribe(({ data }) => {
        //     this.inProgress = false;
        //     this.showEditor(null, false, false);
        //     this.refresh();
        //   }, (error) => {
        //     this.inProgress = false;
        //     if (this.auth.token !== '') {
        //       this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to delete cost settings');
        //     } else {
        //       this.router.navigateByUrl('/');
        //     }
        //   });
        // }
    }

    onSaved(scheme: ContactItem): void {
        this.editorErrorMessage = '';
        this.inProgress = true;
        // this.adminService.saveCostSettings(scheme, this.createScheme).subscribe(({ data }) => {
        //   this.inProgress = false;
        //   this.setEditMode(false);
        //   this.showEditor(null, false, false);
        //   this.createScheme = false;
        //   this.refresh();
        // }, (error) => {
        //   this.inProgress = false;
        //   if (this.auth.token !== '') {
        //     this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to save cost settings');
        //   } else {
        //     this.router.navigateByUrl('/');
        //   }
        // });
    }
}
