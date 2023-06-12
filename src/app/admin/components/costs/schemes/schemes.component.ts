import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { CostScheme } from 'model/cost-scheme.model';
import { SettingsCostListResult } from 'model/generated-models';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-cost-schemes',
	templateUrl: 'schemes.component.html',
	styleUrls: ['schemes.component.scss']
})
export class AdminCostSchemesComponent implements OnInit, OnDestroy {
	displayedColumns: string[] = [
		'details',
		'default',
		'name',
		'target',
		'trxType',
		'instrument',
		'provider'
	];
	inProgress = false;
	errorMessage = '';
	detailsTitle = '';
	permission = 0;
	selectedScheme?: CostScheme;
	schemes: CostScheme[] = [];

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
		this.loadSchemes();
	}

	ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
	}

	private loadSchemes(): void {
		this.schemes = [];
		this.inProgress = true;
		const listData$ = this.adminService.getCostSettings().valueChanges.pipe(take(1));
		this.subscriptions.add(
			listData$.subscribe(({ data }) => {
				const settings = data.getSettingsCost as SettingsCostListResult;
				let itemCount = 0;
				if (settings !== null) {
					itemCount = settings?.count ?? 0;
					if (itemCount > 0) {
						this.schemes = settings?.list?.map((val) => new CostScheme(val)) as CostScheme[];
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

	showDetails(scheme: CostScheme | undefined, content: any): void {
		this.selectedScheme = scheme;
		if (scheme) {
			this.detailsTitle = 'Cost scheme details';
		} else {
			this.detailsTitle = 'Add new cost scheme';
		}
		this.detailsDialog = this.modalService.open(content, {
			backdrop: 'static',
			windowClass: 'modalCusSty',
		});
		this.subscriptions.add(
			this.detailsDialog.closed.subscribe(val => {
				this.loadSchemes();
			})
		);
	}
}
