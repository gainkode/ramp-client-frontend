import { AfterViewInit, Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ContactsFilter } from 'src/app/model/filter.model';
import { UserContactListResult } from 'src/app/model/generated-models';
import { ProfileItemContainer, ProfileItemContainerType } from 'src/app/model/profile-item.model';
import { ContactItem } from 'src/app/model/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorService } from 'src/app/services/error.service';
import { ProfileDataService } from 'src/app/services/profile.service';

@Component({
    selector: 'app-personal-contact-list',
    templateUrl: './contact-list.component.html',
    styleUrls: [
        '../../../../assets/menu.scss',
        '../../../../assets/button.scss',
        '../../../../assets/profile.scss',
        './contact-list.component.scss'
    ]
})
export class PersonalContactListComponent implements OnDestroy, AfterViewInit {
    @Output() onShowDetails = new EventEmitter<ProfileItemContainer>();
    @Output() onError = new EventEmitter<string>();
    @Output() onProgress = new EventEmitter<boolean>();
    @Output() onDataLoaded = new EventEmitter<boolean>();
    @ViewChild(MatSort) sort!: MatSort;

    private pContactsSubscription: Subscription | undefined = undefined;
    private subscriptions: Subscription = new Subscription();
    private pSortSubscription: Subscription | undefined = undefined;
    filter = new ContactsFilter();
    contacts: ContactItem[] = [];
    contactCount = 0;
    selectedContact: ContactItem | null = null;
    loading = false;
    pageCounts = [25, 50, 100];
    pageSize = 25;
    pageIndex = 0;
    sortedField = 'userName';
    sortedDesc = true;
    displayedColumns: string[] = ['icon', 'userName', 'email', 'coin', 'added', 'details'];

    constructor(
        private auth: AuthService,
        private errorHandler: ErrorService,
        private profileService: ProfileDataService,
        private router: Router) {
    }

    load(val: ContactsFilter): void {
        this.filter = val;
        this.loadContacts();
    }

    ngAfterViewInit(): void {
        if (this.sort) {
            this.pSortSubscription = this.sort.sortChange.subscribe(() => {
                this.sortedDesc = (this.sort.direction === 'desc');
                this.sortedField = this.sort.active;
                this.loadContacts();
            });
        }
    }

    ngOnDestroy(): void {
        if (this.pContactsSubscription !== undefined) {
            this.pContactsSubscription.unsubscribe();
            this.pContactsSubscription = undefined;
        }
        if (this.pSortSubscription !== undefined) {
            this.pSortSubscription.unsubscribe();
            this.pSortSubscription = undefined;
        }
        this.subscriptions.unsubscribe();
    }

    private getSortedField(): string {
        let result = this.sortedField;
        if (this.sortedField === 'userName') {
            result = 'displayName';
        } else if (this.sortedField === 'email') {
            result = 'contactEmail';
        } else if (this.sortedField === 'coin') {
            result = 'assetId';
        } else if (this.sortedField === 'added') {
            result = 'created';
        }
        return result;
    }

    private loadContacts(): void {
        this.onError.emit('');
        this.contactCount = 0;
        const contactsData = this.profileService.getMyContacts(
            this.filter.currencies,
            (this.filter.email === '') ? [] : [this.filter.email],
            (this.filter.userName === '') ? [] : [this.filter.userName],
            this.pageIndex,
            this.pageSize,
            this.getSortedField(),
            this.sortedDesc);
        if (contactsData === null) {
            this.onError.emit(this.errorHandler.getRejectedCookieMessage());
        } else {
            this.loading = true;
            this.onProgress.emit(true);
            const userFiat = this.auth.user?.defaultFiatCurrency ?? 'EUR';
            this.pContactsSubscription = contactsData.valueChanges.subscribe(({ data }) => {
                const contactsItems = data.myContacts as UserContactListResult;
                if (contactsItems) {
                    this.contactCount = contactsItems?.count as number;
                    if (this.contactCount > 0) {
                        // this.contacts = contactsItems?.list?.filter(x => {
                        //     return (this.filter.zeroBalance) ? true : x.total ?? 0 > 0;
                        // }).map((val) => new ContactItem(val)) as ContactItem[];
                        this.contacts = contactsItems?.list?.map((val) => new ContactItem(val)) as ContactItem[];
                        this.contactCount = this.contacts.length;
                    }
                }
                this.loading = false;
                this.onProgress.emit(false);
                this.onDataLoaded.emit(this.contactCount > 0);
            }, (error) => {
                this.onProgress.emit(false);
                this.loading = false;
                if (this.auth.token !== '') {
                    this.onError.emit(this.errorHandler.getError(error.message, 'Unable to load wallets'));
                } else {
                    this.router.navigateByUrl('/');
                }
                this.onDataLoaded.emit(false);
            });
        }
    }

    private refresh(): void {
        if (this.pContactsSubscription !== undefined) {
            this.pContactsSubscription.unsubscribe();
            this.pContactsSubscription = undefined;
        }
        this.loadContacts();
    }

    handlePage(event: PageEvent): PageEvent {
        this.pageSize = event.pageSize;
        this.pageIndex = event.pageIndex;
        this.refresh();
        return event;
    }

    showDetailsPanel(item: ContactItem | undefined): void {
        const c = new ProfileItemContainer();
        c.container = ProfileItemContainerType.Contact;
        c.contact = item;
        this.onShowDetails.emit(c);
    }
}
