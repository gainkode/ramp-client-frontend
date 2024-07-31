import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, UntypedFormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NotificationsFilter, ProfileBaseFilter } from 'model/filter.model';

@Component({
	selector: 'app-notifications-filter',
	templateUrl: './notifications-bar.component.html',
	styleUrls: ['../../../assets/menu.scss']
})
export class NotificationsFilterBarComponent implements OnInit, OnDestroy {
    @Input() data: NotificationsFilter | undefined = undefined;
    @Output() update = new EventEmitter<ProfileBaseFilter>();

    private subscriptions: Subscription = new Subscription();
    private searchText = '';

    filterForm = this.formBuilder.group({
    	unreadOnly: [false],
    	search: ['']
    });

    get unreadOnlyField(): AbstractControl | null {
    	return this.filterForm.get('unreadOnly');
    }

    get searchField(): AbstractControl | null {
    	return this.filterForm.get('search');
    }

    constructor(private formBuilder: UntypedFormBuilder) { }

    ngOnInit(): void {
    	if (this.data?.unreadOnly) {
    		this.unreadOnlyField?.setValue(this.data.unreadOnly);
    	}
    	if (this.data?.search) {
    		this.searchText = this.data.search;
    		this.searchField?.setValue(this.data.search);
    	}
    	this.subscriptions.add(
    		this.unreadOnlyField?.valueChanges.subscribe(() => {
    			this.onApply();
    		}));
    }

    ngOnDestroy(): void {
    	this.subscriptions.unsubscribe();
    }

    onSearch(): void {
    	this.searchText = this.searchField?.value ?? '';
    	this.onApply();
    }

    onApply(): void {
    	const filter = new NotificationsFilter();
    	filter.unreadOnly = this.unreadOnlyField?.value;
    	filter.search = this.searchText;
    	this.update.emit(filter);
    }
}
