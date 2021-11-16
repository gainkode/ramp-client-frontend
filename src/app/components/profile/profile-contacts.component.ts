import { Component, Output, EventEmitter, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ContactItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';
import { UserContactListResult } from 'src/app/model/generated-models';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

@Component({
    selector: 'app-contacts',
    templateUrl: './profile-contacts.component.html',
    styleUrls: ['./profile.scss', './profile-contacts.component.scss']
})
export class ProfileContactsComponent {
    @Output() changeEditMode = new EventEmitter<boolean>();
    @ViewChild(MatSort) sort!: MatSort;
    private pShowDetails = false;
    private pContactsSubscription!: any;
    private pEditMode = false;
    inProgress = false;
    errorMessage = '';
    editorErrorMessage = '';
    createContact = false;
    selectedContact: ContactItem | null = null;
    contacts: ContactItem[] = [];
    contactCount = 0;
    pageSize = 25;
    pageIndex = 0;
    sortedField = 'created';
    sortedDesc = true;
    displayedColumns: string[] = ['displayName', 'contactEmail', 'created', 'details'];

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
        this.loadContacts();
    }

    ngOnDestroy(): void {
        const s: Subscription = this.pContactsSubscription;
        if (s !== undefined) {
            (this.pContactsSubscription as Subscription).unsubscribe();
        }
    }

    ngAfterViewInit(): void {
        if (this.sort) {
            this.sort.sortChange.subscribe(() => {
                this.sortedDesc = (this.sort.direction === 'desc');
                this.sortedField = this.sort.active;
                this.loadContacts();
            });
        }
    }

    private loadContacts(): void {
        this.contactCount = 0;
        const contactsData = this.profileService.getMyContacts(
            this.pageIndex,
            this.pageSize,
            this.sortedField,
            this.sortedDesc);
        if (contactsData === null) {
            this.errorMessage = this.errorHandler.getRejectedCookieMessage();
        } else {
            this.inProgress = true;
            this.pContactsSubscription = contactsData.valueChanges.subscribe(({ data }) => {
                const contactsItems = data.myContacts as UserContactListResult;
                if (contactsItems !== null) {
                    this.contactCount = contactsItems?.count as number;
                    if (this.contactCount > 0) {
                        this.contacts = contactsItems?.list?.map((val) => new ContactItem(val)) as ContactItem[];
                    }
                }
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

    refresh(): void {
        const s: Subscription = this.pContactsSubscription;
        this.loadContacts();
    }

    handlePage(event: PageEvent): PageEvent {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.refresh();
        return event;
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

    onDeleteContact(id: string): void {
        this.editorErrorMessage = '';
        this.inProgress = true;
        this.profileService.deleteContact(id).subscribe(({ data }) => {
            this.inProgress = false;
            this.setEditMode(false);
            this.showEditor(null, false, false);
            this.createContact = false;
            this.refresh();
        }, (error) => {
            this.inProgress = false;
            if (this.auth.token !== '') {
                this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to delete a contact');
            } else {
                this.router.navigateByUrl('/');
            }
        });
    }

    onSaved(contact: ContactItem): void {
        this.editorErrorMessage = '';
        this.inProgress = true;
        this.profileService.saveContact(
            contact.id,
            contact.displayName,
            contact.contactEmail, '', '').subscribe(({ data }) => {
            this.inProgress = false;
            this.setEditMode(false);
            this.showEditor(null, false, false);
            this.createContact = false;
            this.refresh();
        }, (error) => {
            this.inProgress = false;
            if (this.auth.token !== '') {
                this.editorErrorMessage = this.errorHandler.getError(error.message, 'Unable to save a contact');
            } else {
                this.router.navigateByUrl('/');
            }
        });
    }
}
