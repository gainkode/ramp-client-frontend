import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { WireTransferBankAccountItem } from 'model/cost-scheme.model';
import { WireTransferBankAccountListResult } from 'model/generated-models';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'services/auth.service';
import { AdminDataService } from 'services/admin-data.service';

@Component({
	selector: 'app-admin-bank-accounts',
	templateUrl: 'accounts.component.html',
	styleUrls: ['accounts.component.scss']
})
export class AdminBankAccountsComponent implements OnInit, OnDestroy {
	displayedColumns: string[] = [
		'details',
		'name',
		'description',
		'auAvailable',
		'ukAvailable',
		'euAvailable'
	];
	inProgress = false;
	errorMessage = '';
	detailsTitle = '';
	permission = 0;
	selectedAccount?: WireTransferBankAccountItem;
	accounts: WireTransferBankAccountItem[] = [];

	private subscriptions: Subscription = new Subscription();
	private detailsDialog: NgbModalRef | undefined = undefined;

	constructor(
		private modalService: NgbModal,
		private auth: AuthService,
		private adminService: AdminDataService,
		private router: Router
	) {
		this.permission = this.auth.isPermittedObjectCode('COSTS');
	}

	ngOnInit(): void {
		this.loadAccounts();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	private loadAccounts(): void {
		this.accounts = [];
		this.inProgress = true;
		const listData$ = this.adminService.getWireTransferBankAccounts().valueChanges.pipe(take(1));
		this.subscriptions.add(
			listData$.subscribe(({ data }) => {
				const settings = data.getWireTransferBankAccounts as WireTransferBankAccountListResult;
				let itemCount = 0;
				if (settings !== null) {
					itemCount = settings?.count ?? 0;
					if (itemCount > 0) {
						this.accounts = settings?.list?.map((val) => new WireTransferBankAccountItem(val)) as WireTransferBankAccountItem[];
					}
				}
				this.inProgress = false;
			}, (error) => {
				this.inProgress = false;
				if (this.auth.token === '') {
					this.router.navigateByUrl('/');
				}
			})
		);
	}

	showDetails(account: WireTransferBankAccountItem | undefined, content: any): void {
		this.selectedAccount = account;
		if (account) {
			this.detailsTitle = 'Bank account details';
		} else {
			this.detailsTitle = 'Add new bank account';
		}
		this.detailsDialog = this.modalService.open(content, {
			backdrop: 'static',
			windowClass: 'modalCusSty',
		});
		this.subscriptions.add(
			this.detailsDialog.closed.subscribe(val => {
				this.loadAccounts();
			})
		);
	}
}
