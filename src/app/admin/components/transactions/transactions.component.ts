import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSort } from '@angular/material/sort';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Filter } from 'admin/model/filter.model';
import { TransactionService } from 'admin/services/transaction.service';
import { SettingsCurrencyWithDefaults, TransactionStatusDescriptorMap, TransactionType, UserRoleObjectCode } from 'model/generated-models';
import { CurrencyView } from 'model/payment.model';
import { TransactionItemFull } from 'model/transaction.model';
import { of, Subject } from 'rxjs';
import { finalize, switchMap, take, takeUntil } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';
import { ProfileDataService } from 'services/profile.service';

const transactionDefaultFilterFields = [
	'accountType',
	'accountMode',
	'country',
	'tier',
	'transactionKycStatus',
	'users',
	'widgetName',
	'search',
	'from',
	'source',
	'createdDate',
	'completedDate',
	'paymentInstrument',
	'transactionIds',
	'transactionType',
	'transactionStatus',
	'walletAddress',
	'fiatCurrency',
	'verifyWhenPaid',
	'transactionFlag',
	'preauthFlag',
	'updatedDate',
	'reversalProcessed',
	'recallRegistered',
	'hasRecallNumber',
	'recallNumber'
];

@Component({
	selector: 'app-admin-transactions',
	templateUrl: 'transactions.component.html',
	styleUrls: ['transactions.component.scss'],
	providers: [TransactionService],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminTransactionsComponent implements OnInit, AfterViewInit {
	@ViewChild(MatSort) sort!: MatSort;
	filterFields = this.auth.getCommonSettingsFilterFields('transactions', transactionDefaultFilterFields);
	displayedColumns: string[] = [
		'details', 'code', 'created', 'accountName', 'email', 'accountStatus', 'type', 'widgetName', 'from', 'to',
		'currencyToSpend', 'amountToSpend', 'currencyToReceive', 'amountToReceive',
		'address', 'instrument', 'paymentProvider', 'status', 'userType', 'source', 'kycStatus', 'id'
	];
	isScreeningInfo = false;
	isLifeLine = false;
	inProgress = false;
	permission = 0;
	unbenchmarkDialog?: NgbModalRef;
	selectedTransaction?: TransactionItemFull;
	selectedForUnbenchmark = false;
	transactionCount = 0;
	transactions: TransactionItemFull[] = [];
	userStatuses: TransactionStatusDescriptorMap[] = [];
	currencyOptions: CurrencyView[] = [];
	pageSize = 50;
	pageIndex = 0;
	sortedField = 'created';
	sortedDesc = true;
	filter = new Filter({});
	fiatCurrencies: Array<CurrencyView> = [];
	adminAdditionalSettings: Record<string, any> = {};
	destroyRef = inject(DestroyRef);
	private detailsDialog: NgbModalRef | undefined = undefined;
	private cancelTransactions$ = new Subject<void>();

	constructor(
		public transactionService: TransactionService,
		private modalService: NgbModal,
		private auth: AuthService,
		private cdr: ChangeDetectorRef,
		private commonDataService: CommonDataService,
		private adminService: AdminDataService,
		private profileService: ProfileDataService,
		public activeRoute: ActivatedRoute,
		private router: Router
	) {
		const filterUserId = activeRoute.snapshot.params['userid'];

		if (filterUserId) {
			this.filter.users = [filterUserId as string];
		}

		this.permission = this.auth.isPermittedObjectCode(UserRoleObjectCode.Transactions);
		this.adminAdditionalSettings = this.auth.getAdminAdditionalSettings();
	}

	ngOnInit(): void {
		this.loadList();
	}

	ngAfterViewInit(): void {
		this.sort.sortChange.pipe(
			takeUntilDestroyed(this.destroyRef), 
			finalize(() => this.cdr.markForCheck())
		).subscribe(() => {
			this.sortedDesc = (this.sort.direction === 'desc');
			this.sortedField = this.sort.active;
			this.loadList();
		});
	}

	private isSelectedTransaction(transactionId: string): boolean {
		return !!this.selectedTransaction && this.selectedTransaction.id === transactionId;
	}

	private loadList(): void {
		if (this.userStatuses.length === 0) {
			this.loadTransactionStatuses();
		} else {
			this.cancelTansactionsObservable();
		}
	}

	private cancelTansactionsObservable(): void {
    this.cancelTransactions$.next();
    this.cancelTransactions$.complete();

		this.cancelTransactions$ = new Subject();
    this.loadTransactions();
  }

	private loadTransactions(): void {
		this.inProgress = true;
		this.selectedForUnbenchmark = false;
	
		this.adminService.getTransactions(this.pageIndex, this.pageSize, this.sortedField, this.sortedDesc,this.filter)
			.pipe(
				takeUntil(this.cancelTransactions$),
				takeUntilDestroyed(this.destroyRef),
				finalize(() => { this.inProgress = false; this.cdr.markForCheck();}),
				take(1))
			.subscribe({
				next: ({ list, count }) => {
					this.transactions = list;
					this.transactionCount = count;
					this.transactions.forEach(val => val.statusInfo = this.userStatuses.find(x => x.key === val.status));

					this.cdr.markForCheck();
				},
				error: () => {
					if (this.auth.token === '') {
						void this.router.navigateByUrl('/');
					}
				},
				complete: () => this.inProgress = false
			});
	}

	private loadTransactionStatuses(): void {
		this.inProgress = true;
		this.userStatuses = [];

		this.profileService.getTransactionStatuses().valueChanges
			.pipe(
				takeUntilDestroyed(this.destroyRef),
				switchMap(result => {
					this.userStatuses = result.data.getTransactionStatuses as TransactionStatusDescriptorMap[];
					return this.commonDataService.getSettingsCurrency()?.valueChanges ?? of(null);
				}),
				take(1),
				finalize(() => this.cdr.markForCheck())
			)
			.subscribe({
				next: ({ data }) => {
					if (data) {
						const currencySettings = data.getSettingsCurrency as SettingsCurrencyWithDefaults;
						if (currencySettings.settingsCurrency && (currencySettings.settingsCurrency.count ?? 0 > 0)) {
							this.currencyOptions = currencySettings.settingsCurrency.list
									?.map((val) => new CurrencyView(val)) as CurrencyView[];
							this.fiatCurrencies = this.currencyOptions.filter(item => item.fiat === true);
						} else {
							this.currencyOptions = [];
						}
					}

					this.loadTransactions();
				},
				error: () => {
					this.inProgress = false;

					if (this.auth.token === '') {
							void this.router.navigateByUrl('/');
					}
				}
			});
	}

	private executeUnbenchmark(): void {
		this.inProgress = true;
		const transacionsIds = this.transactions.filter(x => x.selected === true && x.type !== TransactionType.Receive).map(val => val.id);

		this.adminService.unbenchmarkTransaction(transacionsIds).pipe(
			takeUntilDestroyed(this.destroyRef),
			finalize(() => { this.inProgress = false; this.cdr.markForCheck(); })
		).subscribe({
			next: () => this.transactions.forEach(x => x.selected = false),
			error: () => {
				if (this.auth.token === '') {
					void this.router.navigateByUrl('/');
				}
			}
		});
	}

	refresh(): void {
		this.loadList();
	}

	export(content: any): void {
		this.inProgress = true;

		this.adminService.exportTransactionsToCsv(
			this.transactions.filter(x => x.selected === true).map(val => val.id),
			this.sortedField,
			this.sortedDesc,
			this.filter
		).pipe(
			takeUntilDestroyed(this.destroyRef),
			finalize(() => { this.inProgress = false; this.cdr.markForCheck(); })
		).subscribe({
			next: () => {
				this.modalService.open(content, {
					backdrop: 'static',
					windowClass: 'modalCusSty',
				});
			},
			error: () => {
				if (this.auth.token === '') {
					void this.router.navigateByUrl('/');
				}
			}
		});
	}

	unbenchmark(content: any): void {
		this.unbenchmarkDialog = this.modalService.open(content, {
			backdrop: 'static',
			windowClass: 'modalCusSty',
		});

		this.unbenchmarkDialog.closed
			.pipe(takeUntilDestroyed(this.destroyRef))
			.subscribe(result => {
				if (result === 'Confirm') {
					this.executeUnbenchmark();
				}
			});
	}

	showWallets(transactionId: string): void {
		const transaction = this.transactions.find(x => x.id === transactionId);

		if (transaction?.type === TransactionType.Deposit || transaction?.type === TransactionType.Withdrawal) {
			void this.router.navigateByUrl(`/admin/fiat-wallets/vaults/${transaction?.vaultIds.join('#') ?? ''}`);
		} 
	}

	selectAll(): void {
		this.transactions.forEach(x => x.selected = true);
		this.selectedForUnbenchmark = (this.transactions.length > 0);
	}

	createUserTransactionShow(content: any): void {
		this.detailsDialog = this.modalService.open(content, {
			backdrop: 'static',
			windowClass: 'modalCusSty',
		});
	}

	showDetails(
		transaction: TransactionItemFull, 
		content: any, 
		isScreening: boolean = false,
		isLifeLine: boolean = false): void {
		this.selectedTransaction = transaction;
		this.isScreeningInfo = isScreening;
		this.isLifeLine = isLifeLine;

		this.detailsDialog = this.modalService.open(content, {
			backdrop: 'static',
			windowClass: 'modalCusSty-transacion',
		});
	}

	handlePage(index: number): void {
		this.pageIndex = index - 1;
		this.loadList();
	}

	onTransactionSelected(item: TransactionItemFull): void {
		item.selected = !item.selected;

		this.selectedForUnbenchmark = this.transactions.some(x =>
			x.selected === true && x.type !== TransactionType.Receive);
	}

	toggleDetails(transaction: TransactionItemFull): void {
		this.selectedTransaction = this.isSelectedTransaction(transaction.id) ? transaction : undefined;
	}

	onSaveTransaction(): void {
		this.selectedTransaction = undefined;

		if (this.detailsDialog) {
			this.detailsDialog.close();
			this.loadList();
		}
	}

	onCloseDetails(): void {
		if (this.detailsDialog) {
			this.detailsDialog.dismiss();
		}
	}

	handleFilterApplied(filter: Filter): void {
		this.filter = filter;
		this.pageIndex = 0;

		this.loadList();
	}
}