import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonTargetValue } from 'model/common.model';
import { CostScheme } from 'model/cost-scheme.model';
import { FeeScheme } from 'model/fee-scheme.model';
import { PaymentInstrument, SettingsCostListResult } from 'model/generated-models';
import { Subscription } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';

@Component({
	selector: 'app-admin-fee-assign-cost',
	templateUrl: 'fee-assign-cost.component.html',
	styleUrls: ['fee-assign-cost.component.scss', '../../../assets/scss/_validation.scss']
})
export class AdminFeeAssignCostComponent implements OnInit, OnDestroy {
  @Input() permission = 0;
  @Input()
  set feeSchemas(schemas: FeeScheme[]) {
  	this.feeOptions = this.getFilteredFees(schemas);
  }
  @Output() save = new EventEmitter();
  @Output() close = new EventEmitter();

  private subscriptions: Subscription = new Subscription();
	
  feeOptions: CommonTargetValue[];
  saveInProgress = false;
  costSchemes: CostScheme[] = [];
  errorMessage = '';

  form = this.formBuilder.group({
  	ids: [undefined, Validators.required],
  	costId: [undefined, Validators.required],
  });

  constructor(
  	private formBuilder: UntypedFormBuilder,
  	private router: Router,
  	private auth: AuthService,
  	private adminService: AdminDataService) {

  }

  ngOnInit(): void {
  	this.loadCostSchemeList();
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  private getFilteredFees(feeSchemas: FeeScheme[]): CommonTargetValue[] {
  	return feeSchemas.filter(item => item.instrument.includes(PaymentInstrument.WireTransfer)).map(feeSchema => ({
  		id: feeSchema.id,
  		title: feeSchema.name
  	} as CommonTargetValue));
  }

  private loadCostSchemeList(): void {
  	const listData$ = this.adminService.getCostSettings().valueChanges.pipe(take(1));

  	this.subscriptions.add(
  		listData$.subscribe(({ data }) => {
  			const settings = data.getSettingsCost as SettingsCostListResult;
  			let itemCount = 0;
  			if (settings) {
  				itemCount = settings?.count ?? 0;
  				if (itemCount > 0) {
  					this.costSchemes = settings?.list?.map((val) => new CostScheme(val)) as CostScheme[];
  				}
  			}
  		})
  	);
  }

  feeSearchFn(term: string, item: CommonTargetValue): boolean {
  	term = term.toLocaleLowerCase();
  	return item.title.toLocaleLowerCase().indexOf(term) > -1 ||
		item.id && item.id.toLocaleLowerCase().indexOf(term) > -1;
  }

  onSubmit(): void {
  	this.errorMessage = '';
  	this.saveInProgress = true;
  	const feeSchemaIds = this.form.get('ids')?.value;
  	const costSchemaId = this.form.get('costId')?.value;
  	const requestData$ = this.adminService.assignCostToFees(feeSchemaIds, costSchemaId);
  	
	  this.subscriptions.add(
  		requestData$.pipe(finalize(() => this.saveInProgress = false)).subscribe({
  			next: () => this.save.emit(),
  			error: (errorMessage) => {
  				this.errorMessage = errorMessage;
  				if (this.auth.token === '') {
  					void this.router.navigateByUrl('/');
  				}
  			}
  		})
  	);
  }
}
