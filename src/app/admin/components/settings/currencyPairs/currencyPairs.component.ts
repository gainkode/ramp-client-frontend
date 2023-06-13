import { Clipboard } from '@angular/cdk/clipboard';
import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { CurrencyPairItem } from 'model/currencyPairs.model';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { AdminDataService } from 'services/admin-data.service';
import { AuthService } from 'services/auth.service';
import { CommonDataService } from 'services/common-data.service';

@Component({
	selector: 'app-admin-currencypairs',
	templateUrl: 'currencyPairs.component.html',
	styleUrls: ['currencyPairs.component.scss']
})
export class AdminCurrencyPairsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = [
  	'lock',
  	'id',
  	'currencyFrom',
  	'currencyTo',
  	'fixedRate',
  	'liquidityProviderName',
  	'delete'
  ];
  inProgress = false;
  errorMessage = '';
  permission = 0;
  currencyPairs: CurrencyPairItem[] = [];
  selectedPair: CurrencyPairItem | undefined = undefined;
  apiKey = '';
  secret = '';
  keyCount = 0;
  pageSize = 50;
  pageIndex = 0;
  sortedField = 'currencyTo';
  sortedDesc = true;

  private subscriptions: Subscription = new Subscription();
  private detailsDialog: NgbModalRef | undefined = undefined;
  private createDialog: NgbModalRef | undefined = undefined;

  constructor(
  	private modalService: NgbModal,
  	private auth: AuthService,
  	private adminService: AdminDataService,
  	private commonService: CommonDataService,
  	private clipboard: Clipboard,
  	private router: Router
  ) {
  	this.permission = this.auth.isPermittedObjectCode('SETTINGS');
  }

  ngOnInit(): void {
  	this.loadPairs();
  }

  ngOnDestroy(): void {
  	this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
  	this.subscriptions.add(
  		this.sort.sortChange.subscribe(() => {
  			this.sortedDesc = (this.sort.direction === 'desc');
  			this.sortedField = this.sort.active;
  			this.loadPairs();
  		})
  	);
  }

  handlePage(index: number): void {
  	this.pageIndex = index - 1;
  	this.loadPairs();
  }

  addCurrencyPair(content: any, pairId?: string): void {
  	if(pairId){
  		this.selectedPair = this.currencyPairs.find(item => item.currencyPairLiquidityProviderId == pairId);
  	}
    
  	this.detailsDialog = this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  }

  deleteCurrencyPair(key: CurrencyPairItem, content: any): void {
  	this.selectedPair = key;
  	this.createDialog = this.modalService.open(content, {
  		backdrop: 'static',
  		windowClass: 'modalCusSty',
  	});
  	this.subscriptions.add(
  		this.createDialog.closed.subscribe(val => {
  			this.removeCurrencyPairConfirmed(key.currencyPairLiquidityProviderId);
  		})
  	);
  }

  private removeCurrencyPairConfirmed(currencyPairLiquidityProviderId: string): void {
  	this.errorMessage = '';
  	const deleteKeyData$ = this.adminService.deleteCurrencyPair(currencyPairLiquidityProviderId);
  	this.subscriptions.add(
  		deleteKeyData$.subscribe(({ data }) => {
  			this.loadPairs();
  		}, (error) => {
  			this.errorMessage = error;
  		})
  	);
  }

  private loadPairs(): void {
  	let sf = this.sortedField;
  	if (sf === '') {
  		sf = 'created';
  	} else if (sf === 'title') {
  		sf = 'apiKeyId';
  	}
  	this.currencyPairs = [];
  	this.inProgress = true;
  	const listData$ = this.adminService.getCurrencyPairLiquidityProviders().pipe(take(1));
  	this.subscriptions.add(
  		listData$.subscribe(({ list, count }) => {
  			this.currencyPairs = list;
  			console.log(list);
  			this.keyCount = count;
  			this.inProgress = false;
  		}, (error) => {
  			this.inProgress = false;
  			if (this.auth.token === '') {
  				void this.router.navigateByUrl('/');
  			}
  		})
  	);
  }

  onSaveKey(): void {
  	if (this.detailsDialog) {
  		this.detailsDialog.close();
  		this.loadPairs();
  		this.selectedPair = undefined;
  	}
  }

  onClose(): void {
  	if (this.detailsDialog) {
  		this.detailsDialog.dismiss('Close');
  		this.selectedPair = undefined;
  	}
  }

  copySecret(secret: string): void {
  	this.clipboard.copy(secret);
  }
}
