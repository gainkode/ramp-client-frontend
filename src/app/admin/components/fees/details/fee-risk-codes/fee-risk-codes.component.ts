import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { RiskFeeCode } from 'model/fee-scheme.model';
import { RiskAlertType } from 'model/generated-models';
import { Subject, takeUntil } from 'rxjs';
import { AdminDataService } from 'services/admin-data.service';

@Component({
  selector: 'app-fee-risk-codes',
  templateUrl: './fee-risk-codes.component.html',
  styleUrls: ['./fee-risk-codes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeeRiskCodesComponent implements OnInit, OnDestroy {
  @Input() feeRiskCodes: RiskFeeCode[] = [];

  dataSource: MatTableDataSource<RiskFeeCode> = new MatTableDataSource();
  riskAlertTypes: RiskAlertType[] = [];
  displayedColumns: string[] = [
  	'details',
  	'riskCode',
  	'fee'
  ];
  
  @ViewChild(MatTable) table: MatTable<RiskFeeCode>;
  isListItemContainDuplicate = false;
  private readonly destroy$ = new Subject<void>();

  constructor(private adminService: AdminDataService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource(this.feeRiskCodes);

    this.adminService.getRiskAlertTypes()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.riskAlertTypes = data;

        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
  }

  addFeeRiskCode(): void{
		const lastTableElement = this.dataSource.data.at(-1);

		if (lastTableElement) {
			if (!lastTableElement.riskCode || !lastTableElement.feePercent) return;
		}

  	this.dataSource.data.push({ riskCode: null, feePercent: null, selected: true });

  	this.dataSource = new MatTableDataSource(this.dataSource.data);
    this.cdr.markForCheck();
  }

  deleteFeeRiskCode(rowId: number): void{
    if (rowId > -1) {
      this.dataSource.data.splice(rowId, 1);
      this.table.renderRows();
    }

    this.cdr.markForCheck();
  }

  mapFeeRiskCodes(): RiskFeeCode[] {
    if (this.dataSource.data.length > 0) {
      const feeRiskCodes = [];

  		for (const item of this.dataSource.data) {
  			if (item.selected) {
					feeRiskCodes.push({
						riskCode: item.riskCode,
						feePercent: item.feePercent
					});
  			}
  		}

      return feeRiskCodes;
  	}
    
    return [];
  }

  riskFeesContainsDuplicates(): boolean {
    this.isListItemContainDuplicate = false;

    if (this.dataSource.data.length > 0) {
      this.isListItemContainDuplicate = this.isDuplicate(this.dataSource.data);

      this.cdr.markForCheck();
      return this.isListItemContainDuplicate;
  	}
    
    this.cdr.markForCheck();
    return false;
  }

  private isDuplicate(data: RiskFeeCode[]): boolean {
		const nameCounts = data.reduce<{ [key: string]: number; }>((acc, item) => {
			acc[item.riskCode] = (acc[item.riskCode] || 0) + 1;
			return acc;
		}, {});

		if (Object.values(nameCounts).some(count => count > 1)) {
			return true;
		}

		return false;
	}
}
