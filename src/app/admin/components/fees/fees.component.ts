import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { CostScheme } from 'model/cost-scheme.model';
import { FeeScheme } from 'model/fee-scheme.model';
import { PaymentInstrument, SettingsCostListResult, UserRoleObjectCode } from 'model/generated-models';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-fee-schemes',
	templateUrl: 'fees.component.html',
	styleUrls: ['fees.component.scss']
})
export class AdminFeeSchemesComponent implements OnInit, OnDestroy {
	displayedColumns: string[] = [
		'details',
		'default',
		'name',
		'widgetIds',
		'target',
		'targetValues',
		'trxType',
		'userType',
		'userMode',
		'instrument',
		'provider',
		'currenciesFrom',
		'currenciesTo',
	];
	inProgress = false;
	errorMessage = '';
	detailsTitle = '';
	permission = 0;
	selectedScheme?: FeeScheme;
	schemes: FeeScheme[] = [];
	costs: CostScheme[] = [];

	private readonly destroy$ = new Subject<void>();
	private detailsDialog: NgbModalRef | undefined = undefined;

	constructor(
		private modalService: NgbModal,
		private auth: AuthService,
		private adminService: AdminDataService
	) {
		this.permission = this.auth.isPermittedObjectCode(UserRoleObjectCode.Fees);
	}

	ngOnInit(): void {
		this.loadSchemes();
	}

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
  }

	private loadSchemes(): void {
		const costSchemes$ = this.adminService.getCostSettings().valueChanges.pipe(take(1));
		const feeSchemes$ = this.adminService.getFeeSettings().pipe(take(1));

		this.inProgress = true;

		forkJoin([costSchemes$, feeSchemes$])
		.pipe(takeUntil(this.destroy$))
		.subscribe({
			next: (res) => {
				const costSettings = res[0].data.getSettingsCost as SettingsCostListResult;

				let itemCount = 0;

				if (costSettings !== null) {
					itemCount = costSettings?.count ?? 0;
					if (itemCount > 0) {
						this.costs = costSettings?.list?.map((val) => new CostScheme(val)) as CostScheme[];
					}
				}

				this.schemes = res[1].list;

				res[1].list.forEach(val => {
					if (val.instrument.length > 0 && val.provider.length > 0) {
						const instrumentData = val.instrument[0];
						const providerData = val.provider[0];

						if (instrumentData === PaymentInstrument.WireTransfer) {
							const cost = this.costs.find(x => x.id === providerData);

							if (cost) {
								val.setCostSchemeName(cost.name);
							}
						}
					}
				});

				this.inProgress = false;
			},
			error: (error) => {
				this.errorMessage = error;
				this.inProgress = false;
			},
		});
	}

	showDetails(scheme: FeeScheme | undefined, content: any): void {
		this.selectedScheme = scheme;
		this.detailsTitle = scheme ? 'Fee scheme details' : 'Add new fee scheme';

		this.detailsDialog = this.modalService.open(content, {
			backdrop: 'static',
			windowClass: 'modalCusSty',
		});

		this.detailsDialog.closed.pipe(takeUntil(this.destroy$)).subscribe(() => this.loadSchemes());
	}

	convertToArray(scheme: string): string[]{
		return scheme?.split(',');
	}
}
